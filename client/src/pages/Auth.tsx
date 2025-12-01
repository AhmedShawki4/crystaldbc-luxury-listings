import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "axios";

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

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
        toast({ title: "Welcome back!", description: "You are now signed in." });
      } else {
        if (formState.password !== formState.confirmPassword) {
          toast({ title: "Passwords do not match", variant: "destructive" });
          setLoading(false);
          return;
        }

        await register({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          phone: formState.phone,
        });
        toast({ title: "Account created", description: "Welcome to CrystalDBC" });
      }

      const redirectState = location.state as { from?: { pathname?: string } } | null;
      const redirectTo = redirectState?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Auth error", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      const description = axiosError.response?.data?.message ?? "Please check your credentials and try again.";
      toast({ title: "Authentication failed", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-16 px-4">
      <div className="w-full max-w-lg bg-background border border-border rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {mode === "login"
            ? "Access your personalized dashboard and wishlist"
            : "Register to request viewings, save favorites, and get updates"}
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-2">
                Full Name
              </label>
              <Input id="name" name="name" required value={formState.name} onChange={handleChange} />
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-2">
              Email
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
                Phone (optional)
              </label>
              <Input id="phone" name="phone" value={formState.phone} onChange={handleChange} />
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-sm font-medium block mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={handleChange}
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formState.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {mode === "login" ? "New to CrystalDBC?" : "Already have an account?"}{" "}
          <Link
            to={mode === "login" ? "/auth/register" : "/auth/login"}
            className="text-primary underline font-medium"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
