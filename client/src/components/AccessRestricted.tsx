interface AccessRestrictedProps {
  title?: string;
  message?: string;
}

const AccessRestricted = ({
  title = "Access Restricted",
  message = "You do not have permission to view this page. Please contact an administrator if you believe this is an error.",
}: AccessRestrictedProps) => (
  <div className="min-h-[50vh] w-full flex items-center justify-center">
    <div className="max-w-2xl text-center space-y-4 bg-background border border-border rounded-2xl px-8 py-12 shadow-sm">
      <h2 className="text-3xl font-display font-bold text-primary">{title}</h2>
      <p className="text-muted-foreground text-lg leading-relaxed">{message}</p>
    </div>
  </div>
);

export default AccessRestricted;
