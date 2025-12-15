
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
            <DialogContent className="sm:max-w-xl p-0 border-none bg-transparent shadow-none">
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
