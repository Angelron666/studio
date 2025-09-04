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

interface SettingsDialogProps {
  setConversations: (value: Conversation[] | ((val: Conversation[]) => Conversation[])) => void;
  setActiveId: (id: string | null) => void;
}

export function SettingsDialog({ setConversations, setActiveId }: SettingsDialogProps) {
  const { toast } = useToast();

  const handleClearHistory = () => {
    setConversations([]);
    setActiveId(null);
    toast({
      title: "History Cleared",
      description: "All your conversation data has been removed.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h3 className="mb-2 font-semibold">Data Management</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-medium">Clear History</p>
                    <p className="text-sm text-muted-foreground">This will permanently delete all your sessions.</p>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete all your conversation history.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={handleClearHistory}>
                                    Yes, delete everything
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
