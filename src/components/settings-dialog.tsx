'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Conversation } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

interface SettingsDialogProps {
  setConversations: (value: Conversation[] | ((val: Conversation[]) => Conversation[])) => void;
  setActiveId: (id: string | null) => void;
}

export function SettingsDialog({ setConversations, setActiveId }: SettingsDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleClearHistory = () => {
    setConversations([]);
    setActiveId(null);
    toast({
      title: t('history_cleared_title'),
      description: t('history_cleared_description'),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
          <span className="sr-only">{t('settings_title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings_title')}</DialogTitle>
          <DialogDescription>
            {t('settings_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h3 className="mb-2 font-semibold">{t('data_management_title')}</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-medium">{t('clear_history_title')}</p>
                    <p className="text-sm text-muted-foreground">{t('clear_history_description')}</p>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('clear_button')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('are_you_sure_title')}</DialogTitle>
                            <DialogDescription>
                                {t('are_you_sure_description')}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('cancel_button')}</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={handleClearHistory}>
                                    {t('confirm_delete_button')}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t('close_button')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
