import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { db } from "@/firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/brush/")({
    beforeLoad: ({ context, location }) => {
        if (!context.user) {
            throw redirect({
                to: "/signin",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: Brush,
});

export function CalendarCustomDays() {
    const [dates, setDates] = useState<string[]>([]);
    const now = new Date();
    const id = format(now, "yyyyMM");

    useEffect(() => {
        const _doc = doc(db, "brush", id);

        const unsub = onSnapshot(_doc, (snapshot) => {
            if (!snapshot.exists()) {
                setDates([]);
                return;
            }

            const _dates = snapshot.data().dates;
            setDates(_dates);
        });

        return () => {
            unsub();
        };
    }, [id]);

    const onSelect = async (selected: any) => {
        const formatted = format(selected, "yyyy-MM-dd");
        const _dates = new Set([...dates]);
        if (_dates.has(formatted)) _dates.delete(formatted);
        else _dates.add(formatted);

        const _doc = doc(db, "brush", id);

        await setDoc(
            _doc,
            {
                dates: [..._dates],
            },
            { merge: true },
        );
    };

    return (
        <Calendar
            mode="single"
            onSelect={onSelect}
            numberOfMonths={1}
            disableNavigation
            showOutsideDays={false}
            className="mx-auto max-w-[450px] w-full [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            components={{
                DayButton: ({ children, modifiers, day, ...props }) => {
                    const formatted = format(day.date, "yyyy-MM-dd");
                    const exists = dates.includes(formatted);

                    return (
                        <CalendarDayButton
                            day={day}
                            modifiers={modifiers}
                            {...props}
                        >
                            {children}
                            {!modifiers.outside && (
                                <div>
                                    {exists ? (
                                        <img
                                            loading="lazy"
                                            src="https://cdn.7tv.app/emote/01GB4E5CB0000BJ5HR8F6XV9A0/1x.webp"
                                            alt="Complete"
                                            className="w-8"
                                        />
                                    ) : (
                                        <img
                                            loading="lazy"
                                            src="https://cdn.7tv.app/emote/01H6SKVTWR00049XSVR28FKPP6/1x.webp"
                                            alt="Incomplete"
                                            className="w-8"
                                        />
                                    )}
                                </div>
                            )}
                        </CalendarDayButton>
                    );
                },
            }}
        />
    );
}

function Brush() {
    return (
        <div className="flex flex-1 flex-col px-3 pb-4 mt-4 gap-4 overflow-y-hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl">Brush</h1>
            </div>

            <CalendarCustomDays />
        </div>
    );
}
