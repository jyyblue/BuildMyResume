import { useState } from 'react';
import { Bot, Shield, Loader2, Sparkles, Database } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PuterAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => Promise<void>;
}

export function PuterAuthModal({ isOpen, onClose, onConnect }: PuterAuthModalProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect();
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl p-5 sm:p-6">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Connect AI Assistant
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        To keep BuildMyResume free, limitless, and secure, we partner with <strong className="text-foreground">Puter.js</strong> to power our AI features.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 rounded-lg p-4 my-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">100% Private</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                No permanent accounts required. Start instantly with one click.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Local Storage</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                Your resume data is saved only in your local browser, never on remote servers.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Generous Free Tier</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">
                                Start building immediately with a generous amount of free AI requests.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            "Connect to Continue"
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isConnecting}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
