import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/brush/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [hasDecided, setHasDecided] = useState(false);
    const [hasBrushed, setHasBrushed] = useState(false);

    useEffect(() => {
        const lastBrushed = localStorage.getItem("lastBrushed");
        if (lastBrushed) {
            const lastBrushedDate = new Date(lastBrushed);

            // compute today's midnight
            const now = new Date();
            const midnight = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(), // today's date
                0,
                0,
                0,
                0, // 00:00:00
            );

            if (lastBrushedDate >= midnight) {
                setHasBrushed(true);
                setHasDecided(true);
            } else {
                setHasBrushed(false);
                setHasDecided(true);
            }
        } else {
            setHasBrushed(false);
        }
    }, []);

    const handleBrush = () => {
        localStorage.setItem("lastBrushed", new Date().toISOString());
        setHasBrushed(true);
        setHasDecided(true);
    };

    const handleNotBrushed = () => {
        localStorage.removeItem("lastBrushed");
        setHasBrushed(false);
        setHasDecided(true);
    };

    const handleReset = () => {
        localStorage.removeItem("lastBrushed");
        setHasBrushed(false);
        setHasDecided(false);
    };

    const didNotBrushToday = hasDecided && !hasBrushed;
    const didBrushToday = hasDecided && hasBrushed;

    return (
        <div className="flex flex-1 flex-col px-3 pb-4 mt-4 gap-4 overflow-y-hidden">
            <div className="text-center">
                <img
                    className={cn("mx-auto mb-4", {
                        hidden: !hasDecided || didNotBrushToday,
                        block: didBrushToday,
                    })}
                    loading="eager"
                    src="https://cdn.7tv.app/emote/01FMGFYYWG000D6HG894PC6KZ3/2x.webp"
                    alt="Clapgers"
                />
                <img
                    className={cn("mx-auto mb-4", {
                        hidden: hasDecided,
                        block: !hasDecided,
                    })}
                    loading="eager"
                    src="//cdn.7tv.app/emote/01JFBT3Z27D5KFYQWBZBXNJG6Z/2x.webp"
                    alt="Brushgers"
                />
                <img
                    className={cn("mx-auto mb-4", {
                        hidden: !hasDecided || didBrushToday,
                        block: didNotBrushToday,
                    })}
                    src="//cdn.7tv.app/emote/01FMKAPKW8000D6HG894PC6XTT/2x.webp"
                    alt="Crygers"
                />
                {!hasDecided && <p>Have you brushed your teeth today?</p>}
                {didBrushToday && (
                    <p>Great work! You've brushed your teeth today.</p>
                )}
                {didNotBrushToday && <p>Don't forget to brush your teeth!</p>}
            </div>
            <div>
                {hasDecided && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-white rounded border border-white/50"
                        >
                            Start over
                        </button>
                    </div>
                )}
                {!hasDecided && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={handleNotBrushed}
                            className="px-4 py-2 text-red-600 rounded"
                        >
                            No
                        </button>
                        <button
                            onClick={handleBrush}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Yes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
