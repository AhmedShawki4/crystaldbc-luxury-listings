
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
            <DialogContent className="sm:max-w-xl w-[95vw] sm:w-full p-0 border-none bg-transparent shadow-none [&>button]:hidden max-h-[85vh] sm:max-h-[95vh] overflow-y-auto mx-auto rounded-xl">
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
