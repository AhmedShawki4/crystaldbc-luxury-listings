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
import { cn } from "@/lib/utils";

export const AuthCard = ({
  mode,
  onSuccess,
  onSwitchMode,
}: {
  mode: "login" | "register";
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}) => {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formMotion = useMemo(() => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  }), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        // Validate email format for login
        if (!formState.email.trim()) {
          setErrors({ email: t("auth.validation.emailRequired") });
          toast({ title: t("auth.meta.authFailed"), description: t("auth.validation.emailRequired"), variant: "destructive" });
          setLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
          setErrors({ email: t("auth.validation.emailInvalid") });
          toast({ title: t("auth.meta.authFailed"), description: t("auth.validation.emailInvalid"), variant: "destructive" });
          setLoading(false);
          return;
        }
        await login({ email: formState.email, password: formState.password });
        toast({ title: t("auth.meta.welcomeBack"), description: t("auth.meta.signedIn") });
      } else {
        const newErrors: Record<string, string> = {};

        if (!formState.name.trim()) {
          newErrors.name = t("auth.validation.nameRequired");
        }

        if (!formState.email.trim()) {
          newErrors.email = t("auth.validation.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
          newErrors.email = t("auth.validation.emailInvalid");
        }

        if (!formState.phone.trim()) {
          newErrors.phone = t("auth.validation.phoneRequired");
        }

        if (formState.password.length < 6) {
          newErrors.password = t("auth.validation.passwordMin");
        } else if (!/\d/.test(formState.password)) {
          newErrors.password = t("auth.validation.passwordNumber");
        }

        if (formState.password !== formState.confirmPassword) {
          newErrors.confirmPassword = t("auth.validation.passwordMismatch");
        }

        if (Object.keys(newErrors).length) {
          setErrors(newErrors);
          toast({ title: t("auth.meta.passwordPolicyTitle"), description: Object.values(newErrors).join(" \u2022 "), variant: "destructive" });
          setLoading(false);
          return;
        }

        setErrors({});
        await register({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          phone: formState.phone,
        });
        toast({ title: t("auth.meta.created"), description: t("auth.meta.welcome") });
      }

      onSuccess?.();
      // If we are in a modal (onSuccess is provided usually implies this, but let's be safe), 
      // we might not want to navigate. But the original code only navigated if !onSuccess.
      if (!onSuccess) {
        const redirectState = location.state as { from?: { pathname?: string } } | null;
        const redirectTo = redirectState?.from?.pathname ?? "/";
        navigate(redirectTo, { replace: true });
      }
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
    <motion.div
      className="w-full max-w-lg bg-background border border-border rounded-lg p-4 sm:p-8 shadow-lg"
      {...formMotion}
    >
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6"
        {...formMotion}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      >
        <div>
          <motion.h1 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-2" {...formMotion} transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}>
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </motion.h1>
          <motion.p className="text-muted-foreground" {...formMotion} transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}>
            {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </motion.p>
        </div>
      </motion.div>

      <motion.form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} {...formMotion} transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}>
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="text-sm font-medium block mb-2">
              {t("auth.fields.name")}
            </label>
            <Input
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
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
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="phone" className="text-sm font-medium block mb-2">
              {t("auth.fields.phone")}
            </label>
            <Input
              id="phone"
              name="phone"
              required
              value={formState.phone}
              onChange={handleChange}
              className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
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
              className={cn("pr-12", errors.password && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.password}
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
              {t("auth.validation.passwordHint")}
            </p>
          )}
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
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
                className={cn("pr-12", errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={!!errors.confirmPassword}
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
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.actions.processing") : mode === "login" ? t("auth.actions.submitLogin") : t("auth.actions.submitRegister")}
        </Button>
      </motion.form>

      <p className="text-sm text-muted-foreground text-center mt-4 sm:mt-6">
        {mode === "login" ? t("auth.meta.newUser") : t("auth.meta.haveAccount")} {" "}
        {onSwitchMode ? (
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-primary underline font-medium cursor-pointer"
          >
            {mode === "login" ? t("auth.meta.createOne") : t("auth.meta.signIn")}
          </button>
        ) : (
          <Link
            to={mode === "login" ? "/auth/register" : "/auth/login"}
            className="text-primary underline font-medium"
          >
            {mode === "login" ? t("auth.meta.createOne") : t("auth.meta.signIn")}
          </Link>
        )}
      </p>
    </motion.div>
  );
};

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-16 px-4">
      <AuthCard mode={mode} />
    </div>
  );
};

export default AuthPage;
