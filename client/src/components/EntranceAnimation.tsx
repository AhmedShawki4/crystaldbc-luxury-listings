import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";

const EntranceAnimation = () => {
    const [isVisible, setIsVisible] = useState(() => {
        // Check session storage on mount
        return !sessionStorage.getItem("animation_played");
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const lobbyRef = useRef<HTMLDivElement>(null);      // Layer 1 (Back)
    const hallway2Ref = useRef<HTMLDivElement>(null);   // Layer 2
    const hallway1Ref = useRef<HTMLDivElement>(null);   // Layer 3
    const openedDoorRef = useRef<HTMLDivElement>(null); // Layer 4
    const entranceRef = useRef<HTMLDivElement>(null);   // Layer 5 (Front)

    useLayoutEffect(() => {
        if (!isVisible || !containerRef.current) return;

        const ctx = gsap.context(() => {
            // Initial positioning - all layers centered and covering screen
            gsap.set([lobbyRef.current, hallway2Ref.current, hallway1Ref.current, openedDoorRef.current, entranceRef.current], {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transformOrigin: "center center"
            });

            // Set initial z-indices
            gsap.set(lobbyRef.current, { zIndex: 1 });
            gsap.set(hallway2Ref.current, { zIndex: 2 });
            gsap.set(hallway1Ref.current, { zIndex: 3 });
            gsap.set(openedDoorRef.current, { zIndex: 4, opacity: 0 }); // Hidden initially
            gsap.set(entranceRef.current, { zIndex: 5 });

            // Initial scale for movement effect
            gsap.set(lobbyRef.current, { scale: 1 });
            gsap.set(hallway2Ref.current, { scale: 1.2 });
            gsap.set(hallway1Ref.current, { scale: 1.2 });
        }, containerRef);

        return () => ctx.revert();
    }, [isVisible]);

    const handleEnter = () => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                sessionStorage.setItem("animation_played", "true");
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => setIsVisible(false)
                });
            }
        });

        // Step 1: Click Entrance -> Show Opened Door
        // Instant switch or very fast fade to simulate door opening
        tl.to(entranceRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power1.inOut"
        })
            .to(openedDoorRef.current, {
                opacity: 1,
                duration: 0.1,
            }, "<");

        // Step 2: Zoom into Opened Door -> Reveal Hallway 1
        tl.to(openedDoorRef.current, {
            opacity: 0,
            duration: 2.5,
            ease: "power1.inOut"
        })
            .fromTo(hallway1Ref.current,
                { opacity: 0, scale: 1.2 },
                { opacity: 1, scale: 1.8, duration: 2.5, ease: "power1.inOut" },
                "<" // Overlap start
            );

        // Step 3: Zoom Hallway 1 -> Reveal Hallway 2
        tl.to(hallway1Ref.current, {
            opacity: 0,
            duration: 2.5,
            ease: "power1.inOut"
        })
            .fromTo(hallway2Ref.current,
                { opacity: 0, scale: 1.2 },
                { opacity: 1, scale: 1.5, duration: 2.5, ease: "power1.inOut" },
                "-=1.5" // Start before previous finishes
            );

        // Step 4: Zoom Hallway 2 -> Reveal Lobby
        tl.to(hallway2Ref.current, {
            opacity: 0,
            duration: 2.5,
            ease: "power1.inOut"
        })
            .fromTo(lobbyRef.current,
                { opacity: 0, scale: 1.1 }, // Slight zoom out for final landing
                { opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" },
                "-=1.5"
            );
    };

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-black overflow-hidden cursor-pointer" onClick={handleEnter}>
            {/* Layer 1: Lobby (Final Destination) */}
            <div ref={lobbyRef}>
                <img src="/lobby.jpeg" alt="Lobby" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Layer 2: Hallway 2 */}
            <div ref={hallway2Ref}>
                <img src="/hallway2.jpeg" alt="Hallway 2" className="w-full h-full object-cover" />
            </div>

            {/* Layer 3: Hallway 1 */}
            <div ref={hallway1Ref}>
                <img src="/hallway1.jpeg" alt="Hallway 1" className="w-full h-full object-cover" />
            </div>

            {/* Layer 4: Opened Door */}
            <div ref={openedDoorRef}>
                <img src="/openeddoor.jpeg" alt="Opened Door" className="w-full h-full object-cover" />
            </div>

            {/* Layer 5: Entrance (First View) */}
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
