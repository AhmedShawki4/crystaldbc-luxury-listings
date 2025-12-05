import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formMotion = useMemo(() => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  }), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: formState.email, password: formState.password });
        toast({ title: t("auth.meta.welcomeBack"), description: t("auth.meta.signedIn") });
      } else {
        if (formState.password !== formState.confirmPassword) {
          toast({ title: t("auth.meta.passwordsMismatch"), variant: "destructive" });
          setLoading(false);
          return;
        }

        const passwordChecks = [
          { ok: formState.password.length >= 10, message: t("auth.meta.passwordMin") },
          { ok: /[a-z]/.test(formState.password), message: t("auth.meta.passwordLower") },
          { ok: /[A-Z]/.test(formState.password), message: t("auth.meta.passwordUpper") },
          { ok: /\d/.test(formState.password), message: t("auth.meta.passwordNumber") },
          { ok: /[^A-Za-z0-9]/.test(formState.password), message: t("auth.meta.passwordSpecial") },
        ];
        const failedChecks = passwordChecks.filter((check) => !check.ok).map((check) => check.message);
        if (failedChecks.length) {
          toast({ title: t("auth.meta.passwordPolicyTitle"), description: failedChecks.join(" • "), variant: "destructive" });
          setLoading(false);
          return;
        }

        await register({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          phone: formState.phone,
        });
        toast({ title: t("auth.meta.created"), description: t("auth.meta.welcome") });
      }

      const redirectState = location.state as { from?: { pathname?: string } } | null;
      const redirectTo = redirectState?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Auth error", error);
      const axiosError = error as AxiosError<{ message?: string; errors?: Array<{ msg?: string }> }>;
      const serverValidation = axiosError.response?.data?.errors?.[0]?.msg;
      const description = serverValidation ?? axiosError.response?.data?.message ?? t("auth.meta.checkCredentials");
      toast({ title: t("auth.meta.authFailed"), description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-16 px-4">
      <motion.div
        className="w-full max-w-lg bg-background border border-border rounded-lg p-8 shadow-lg"
        {...formMotion}
      >
        <motion.h1 className="text-3xl font-display font-bold text-primary mb-2" {...formMotion} transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}>
          {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
        </motion.h1>
        <motion.p className="text-muted-foreground mb-8" {...formMotion} transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}>
          {mode === "login"
            ? t("auth.loginSubtitle")
            : t("auth.registerSubtitle")}
        </motion.p>

        <motion.form className="space-y-5" onSubmit={handleSubmit} {...formMotion} transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}>
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-2">
                {t("auth.fields.name")}
              </label>
              <Input id="name" name="name" required value={formState.name} onChange={handleChange} />
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-2">
                {t("auth.fields.email")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={handleChange}
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="phone" className="text-sm font-medium block mb-2">
                {t("auth.fields.phone")}
              </label>
              <Input id="phone" name="phone" value={formState.phone} onChange={handleChange} />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium block mb-2">
              {t("auth.fields.password")}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formState.password}
                onChange={handleChange}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === "register" && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("auth.meta.passwordRequirements")}
              </p>
            )}
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
                {t("auth.fields.confirmPassword")}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.actions.processing") : mode === "login" ? t("auth.actions.submitLogin") : t("auth.actions.submitRegister")}
          </Button>
        </motion.form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {mode === "login" ? t("auth.meta.newUser") : t("auth.meta.haveAccount")} {" "}
          <Link
            to={mode === "login" ? "/auth/register" : "/auth/login"}
            className="text-primary underline font-medium"
          >
            {mode === "login" ? t("auth.meta.createOne") : t("auth.meta.signIn")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
