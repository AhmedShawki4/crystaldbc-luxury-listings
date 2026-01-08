
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
            <DialogContent className="fixed bottom-0 left-0 right-0 top-auto w-full max-w-none rounded-t-2xl rounded-b-none border-t border-border bg-background p-0 max-h-[80vh] overflow-y-auto sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-full sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:border-2 sm:border-accent sm:max-h-[90vh] [&>button]:hidden">
                <AuthCard
                    mode={initialMode}
                    onSuccess={() => {
                        onOpenChange(false);
                        onAuthSuccess?.();
                    }}
                    onSwitchMode={onSwitchMode}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
