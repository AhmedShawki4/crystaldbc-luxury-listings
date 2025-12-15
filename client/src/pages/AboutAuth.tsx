import { Component, type ReactNode, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import About from "./About";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthCard } from "./Auth";

class SilentErrorBoundary extends Component<{ children?: ReactNode }, { hasError: boolean }> {
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const AboutAuth = () => {
  const navigate = useNavigate();
  const params = useParams();

  const mode = useMemo<"login" | "register">(() => {
    return params.mode === "register" ? "register" : "login";
  }, [params.mode]);

  const close = () => {
    navigate("/about", { replace: true });
  };

  return (
    <>
      {/* About is just the background for the auth modal; don't let it break login/register. */}
      <SilentErrorBoundary>
        <About />
      </SilentErrorBoundary>
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-xl">
          <AuthCard mode={mode} onSuccess={close} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AboutAuth;
