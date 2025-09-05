'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Conversation } from '@/lib/types';
import { History, PlusCircle, Lightbulb, Bot } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useLanguage } from '@/context/language-context';

interface HistorySidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSetActiveId: (id: string) => void;
  onNewConversation: () => void;
  generateTopics: (args: { previousTopics: string[] }) => Promise<{ suggestedTopics: string[] }>;
}

export function HistorySidebar({
  conversations,
  activeId,
  onSetActiveId,
  onNewConversation,
  generateTopics,
}: HistorySidebarProps) {
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const { t, language } = useLanguage();

  const locale = language === 'es' ? es : enUS;

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const previousTopics = conversations.map(c => c.summary).filter(Boolean);
        const { suggestedTopics: newTopics } = await generateTopics({ previousTopics });
        setSuggestedTopics(newTopics);
      } catch (error) {
        console.error('Failed to fetch suggested topics:', error);
        setSuggestedTopics([]); // Set empty on error
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [conversations, generateTopics]);

  return (
    <Sidebar>
      <SidebarHeader>
        <Button onClick={onNewConversation} className="w-full">
          <PlusCircle />
          <span>{t('new_session_button')}</span>
        </Button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <History />
              <span>{t('history_title')}</span>
            </SidebarGroupLabel>
            <SidebarMenu>
              {conversations.length > 0 ? (
                conversations.map((convo) => (
                  <SidebarMenuItem key={convo.id}>
                    <SidebarMenuButton
                      onClick={() => onSetActiveId(convo.id)}
                      isActive={activeId === convo.id}
                      className="flex flex-col items-start h-auto"
                    >
                      <span className="font-medium">{convo.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(convo.createdAt), { addSuffix: true, locale })}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <p className="p-2 text-sm text-muted-foreground">{t('no_sessions_yet')}</p>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Lightbulb />
              <span>{t('suggested_topics_title')}</span>
            </SidebarGroupLabel>
            <SidebarMenu>
              {isLoadingTopics ? (
                <>
                  <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                  <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                  <SidebarMenuItem><Skeleton className="h-8 w-full" /></SidebarMenuItem>
                </>
              ) : suggestedTopics.length > 0 ? (
                suggestedTopics.map((topic, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton size="sm" className="pointer-events-none text-left">
                      <Bot className="text-accent" />
                      <span>{topic}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <p className="p-2 text-sm text-muted-foreground">{t('no_suggestions_available')}</p>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
