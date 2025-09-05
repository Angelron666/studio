'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ScribeLogo } from '@/components/icons';
import { HistorySidebar } from '@/components/history-sidebar';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Conversation } from '@/lib/types';
import {
  generateSummaryAction,
  generateTopicsAction,
} from '@/app/actions';
import { Download, Mic, Square, BrainCircuit, FileText, Languages } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/context/language-context';

// Polyfill for uuid
let hasWarned = false;
if (typeof window !== 'undefined' && !window.crypto) {
  if (!hasWarned) {
    console.warn('`window.crypto` is not available. UUIDs will be less random.');
    hasWarned = true;
  }
  // @ts-ignore
  window.crypto = {
    // @ts-ignore
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    },
  };
}

const WelcomeScreen = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <ScribeLogo className="w-24 h-24 mb-4 text-primary" />
      <h1 className="text-4xl font-bold font-headline">{t('welcome_title')}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {t('welcome_subtitle')}
      </p>
      <p className="mt-4">
        {t('welcome_instruction')}
      </p>
    </div>
  );
};


export default function Home() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    'scribe-conversations',
    []
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const { toast } = useToast();
  const { t, language, toggleLanguage } = useLanguage();

  const recognitionRef = React.useRef<any>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  useEffect(() => {
    if (activeConversation) {
      setTranscript(activeConversation.transcript);
      setSummary(activeConversation.summary);
    } else {
      setTranscript('');
      setSummary('');
    }
  }, [activeConversation]);

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    [setConversations]
  );
  
  const setupRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({
            variant: "destructive",
            title: t('error_browser_not_supported_title'),
            description: t('error_browser_not_supported_description'),
        });
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

    recognition.onresult = (event) => {
        const newTranscript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
        setTranscript(newTranscript);
        if (activeId) {
          updateConversation(activeId, { transcript: newTranscript });
        }
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        return; // Ignore no-speech errors
      }
      toast({
        variant: 'destructive',
        title: t('error_speech_recognition_title'),
        description: event.error,
      });
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
        if(isRecording){
            recognition.start();
        }
    };

    recognitionRef.current = recognition;
  }, [toast, activeId, updateConversation, isRecording, language, t]);

  useEffect(() => {
    setupRecognition();
  }, [setupRecognition]);

  const handleStartRecording = async () => {
    if (isRecording || !activeId) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        recognitionRef.current?.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
            variant: "destructive",
            title: t('error_microphone_access_denied_title'),
            description: t('error_microphone_access_denied_description'),
        });
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    // You can now do something with the audioBlob, e.g., save or process it.
    audioChunksRef.current = [];
    
    if (transcript.trim().length > 10) {
      handleGenerateSummary();
    }
  };

  const handleGenerateSummary = async () => {
    if (!activeId || !transcript) return;

    setIsGenerating(true);
    try {
      const history = conversations
        .filter((c) => c.id !== activeId)
        .map((c) => c.summary)
        .filter(Boolean);

      const result = await generateSummaryAction({ transcript, history });

      if (result.error) {
        toast({
          variant: 'destructive',
          title: t('error_generic_title'),
          description: result.error,
        });
      } else if (result.summary) {
        setSummary(result.summary);
        updateConversation(activeId, { summary: result.summary });
      } else {
        toast({
            variant: 'destructive',
            title: t('error_generic_title'),
            description: t('error_generate_summary_failed'),
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('error_generic_title'),
        description:
          error instanceof Error ? error.message : t('error_generate_summary_failed_generic'),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewConversation = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: `${t('session_title_prefix')} ${conversations.length + 1}`,
      transcript: '',
      summary: '',
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveId(newId);
  };
  
  const handleDownload = (format: 'txt' | 'md') => {
    if (!summary) return;
    const blob = new Blob([summary], { type: format === 'txt' ? 'text/plain' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribe-notes-${activeConversation?.title.replace(' ','-') || 'session'}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider>
      <HistorySidebar
        conversations={conversations}
        activeId={activeId}
        onSetActiveId={setActiveId}
        onNewConversation={handleNewConversation}
        generateTopics={generateTopicsAction}
      />
      <SidebarInset className="bg-background">
        <header className="flex items-center justify-between p-4 border-b">
          <ScribeLogo className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages />
              <span className="sr-only">{t('toggle_language')}</span>
            </Button>
            <SettingsDialog setConversations={setConversations} setActiveId={setActiveId}/>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-auto">
          {!activeConversation ? (
            <WelcomeScreen />
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Mic className="text-primary" />
                      <span>{t('transcribe_audio_title')}</span>
                    </div>
                    <Button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        variant={isRecording ? 'destructive' : 'default'}
                        size="lg"
                        className={`rounded-full w-28 ${isRecording ? 'pulsate' : ''}`}
                    >
                        {isRecording ? <Square className="mr-2" /> : <Mic className="mr-2" />}
                        {isRecording ? t('stop_button') : t('record_button')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      if (activeId) updateConversation(activeId, { transcript: e.target.value });
                    }}
                    placeholder={t('transcript_placeholder')}
                    className="min-h-[200px] text-base"
                    readOnly={isRecording}
                  />
                  {!isRecording && transcript && (
                    <Button onClick={handleGenerateSummary} disabled={isGenerating} className="mt-4">
                      <BrainCircuit className="mr-2"/>
                      {isGenerating ? t('generating_notes_button_loading') : t('generate_notes_button')}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {isGenerating && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-accent" />
                      <span>{t('study_notes_title')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              )}

              {summary && !isGenerating && (
                <Card>
                   <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                        <FileText className="text-accent" />
                        <span>{t('study_notes_title')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload('txt')}><Download className="mr-2 h-4 w-4"/>TXT</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload('md')}><Download className="mr-2 h-4 w-4"/>MD</Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">{summary}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
