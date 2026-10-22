import { useEffect, useRef, useCallback } from "react";

const DEFAULT_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

/**
 * Déclenche `onIdle` si aucune activité utilisateur (souris, clavier, scroll, touch, clic)
 * n'est détectée pendant `timeoutMs`. Le minuteur est réinitialisé à chaque activité.
 */
export function useIdleTimer(timeoutMs, onIdle) {
    const timerRef = useRef(null);
    const onIdleRef = useRef(onIdle);
    onIdleRef.current = onIdle;

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            onIdleRef.current();
        }, timeoutMs);
    }, [timeoutMs]);

    useEffect(() => {
        resetTimer();
        DEFAULT_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            DEFAULT_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [resetTimer]);
}

export default useIdleTimer;
