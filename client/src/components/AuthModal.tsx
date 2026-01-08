
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthCard } from "@/pages/Auth";

interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialMode?: "login" | "register";
    onSwitchMode?: () => void;
    onAuthSuccess?: () => void;
}

const AuthModal = ({
    isOpen,
    onOpenChange,
    initialMode = "login",
    onSwitchMode,
    onAuthSuccess,
}: AuthModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="fixed bottom-0 left-0 right-0 top-auto w-full max-w-none rounded-t-2xl rounded-b-none border-t border-border bg-background p-0 max-h-[85vh] overflow-y-auto sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-full sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:border sm:max-h-[95vh] [&>button]:top-3 [&>button]:right-3 sm:[&>button]:top-4 sm:[&>button]:right-4 [&>button]:z-10">
                {/* Mobile Handle - allows users to see they can tap outside to close */}
                <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                <div className="pt-6 sm:pt-0">
                    <AuthCard
                        mode={initialMode}
                        onSuccess={() => {
                            onOpenChange(false);
                            onAuthSuccess?.();
                        }}
                        onSwitchMode={onSwitchMode}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
