import { useState, useEffect } from "react";

export function useMobile() {
    const [isMobile, setIsMobile] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Check initial
        checkMobile();
        setIsHydrated(true);

        // Listen to resize
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Return false during SSR to match server render
    return isHydrated ? isMobile : false;
}
