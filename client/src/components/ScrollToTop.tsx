import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Scroll to top"
      className={cn(
        "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full",
        "bg-luxury-gold/90 text-luxury-dark shadow-lg shadow-luxury-gold/25",
        "flex items-center justify-center",
        "hover:bg-luxury-gold hover:shadow-xl hover:shadow-luxury-gold/30 hover:scale-110",
        "transition-all duration-300",
        "backdrop-blur-sm border border-luxury-gold-light/30",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTop;
