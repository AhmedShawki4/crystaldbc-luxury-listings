import { useEffect, useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";

const EntranceAnimation = () => {
    const [isVisible, setIsVisible] = useState(() => {
        // Check localStorage on mount - shows only once per new user
        return !localStorage.getItem("animation_played_once");
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const hallway1Ref = useRef<HTMLDivElement>(null);   // Layer 1 (Back - Final Destination)
    const openedDoorRef = useRef<HTMLDivElement>(null); // Layer 2
    const entranceRef = useRef<HTMLDivElement>(null);   // Layer 3 (Front)

    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        const prevOverflow = document.body.style.overflow;
        const prevOverscroll = (document.body.style as any).overscrollBehavior;
        const prevTouchAction = document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        (document.body.style as any).overscrollBehavior = "none";
        document.body.style.touchAction = "none";

        return () => {
            document.body.style.overflow = prevOverflow;
            (document.body.style as any).overscrollBehavior = prevOverscroll;
            document.body.style.touchAction = prevTouchAction;
        };
    }, [isVisible]);

    useLayoutEffect(() => {
        if (!isVisible || !containerRef.current) return;

        const ctx = gsap.context(() => {
            // Initial positioning - all layers centered and covering screen
            gsap.set([hallway1Ref.current, openedDoorRef.current, entranceRef.current], {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transformOrigin: "center center"
            });

            // Set initial z-indices
            gsap.set(hallway1Ref.current, { zIndex: 1 });
            gsap.set(openedDoorRef.current, { zIndex: 2, opacity: 0 }); // Hidden initially
            gsap.set(entranceRef.current, { zIndex: 3 });

            // Initial scale for movement effect
            gsap.set(hallway1Ref.current, { scale: 1.2 });
        }, containerRef);

        return () => ctx.revert();
    }, [isVisible]);

    const handleEnter = () => {
        if (!containerRef.current || hasStarted) return;

        setHasStarted(true);

        const tl = gsap.timeline({
            onComplete: () => {
                localStorage.setItem("animation_played_once", "true");
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => setIsVisible(false)
                });
            }
        });

        // Step 1: Click Entrance -> Show Opened Door (fast)
        tl.to(entranceRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.inOut"
        })
            .to(openedDoorRef.current, {
                opacity: 1,
                duration: 0.1,
            }, "<");

        // Step 2: Zoom into Opened Door -> Reveal Hallway 1 (Final)
        tl.to(openedDoorRef.current, {
            opacity: 0,
            duration: 1.0,
            ease: "power1.inOut"
        })
            .fromTo(hallway1Ref.current,
                { opacity: 0, scale: 1.2 },
                { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
                "-=0.6"
            );
    };

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className={
                "fixed inset-0 z-[100] bg-black overflow-hidden" +
                (hasStarted ? " cursor-default pointer-events-none" : " cursor-pointer")
            }
            onClick={handleEnter}
        >
            {/* Layer 1: Hallway 1 (Final Destination) */}
            <div ref={hallway1Ref}>
                <img src="/hallway1.jpeg" alt="Hallway" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Layer 2: Opened Door */}
            <div ref={openedDoorRef}>
                <img src="/openeddoor.jpeg" alt="Opened Door" className="w-full h-full object-cover" />
            </div>

            {/* Layer 3: Entrance (First View) */}
            <div ref={entranceRef}>
                <img src="/entrance.jpeg" alt="Entrance" className="w-full h-full object-cover" />

                {/* Enter Button Indicator */}
                <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center animate-pulse group-hover:bg-white/10 transition-colors">
                        <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                    </div>
                    <span className="text-white/80 font-display tracking-[0.3em] text-sm group-hover:text-white transition-colors">
                        CLICK TO ENTER
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EntranceAnimation;

