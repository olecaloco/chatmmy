import { useMemo, useState } from "react";
import { Slider } from "../ui/slider";
import { MAX_HOURS, MAX_MINUTES } from "./constants";

export const Timer = () => {
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);

    // const hoursInSeconds = useMemo(() => {
    //     return 60 * 60 * hours;
    // }, [hours]);

    // const minutesInSeconds = useMemo(() => {
    //     return 60 * minutes;
    // }, [minutes]);

    // const totalSeconds = useMemo(() => {
    //     return hoursInSeconds + minutesInSeconds;
    // }, [hoursInSeconds, minutesInSeconds]);

    const formattedTTF = useMemo(() => {
        let hoursFormat = hours < 10 ? `0${hours}` : hours;
        let minutesFormat = minutes < 10 ? `0${minutes}` : minutes;
        return `${hoursFormat}:${minutesFormat}`;
    }, [hours, minutes]);

    const onHoursChange = (value: number[]): void => {
        setHours(value[0]);
    }

    const onMinutesChange = (value: number[]): void => {
        setMinutes(value[0]);
    }

    return (
        <form className="container">
            <div className="mb-2">
                <label className="inline-block mb-3" htmlFor="hours">
                    Hours{" "}
                    <span className="text-xs text-muted-foreground">
                        ({MAX_HOURS} hours max)
                    </span>
                </label>
                <Slider
                    id="hours"
                    name="hours"
                    value={[hours]}
                    min={0}
                    max={MAX_HOURS}
                    onValueChange={onHoursChange}
                />
            </div>
            <div className="mb-2">
                <label className="inline-block mb-3" htmlFor="minutes">
                    Minutes{" "}
                    <span className="text-xs text-muted-foreground">
                        ({MAX_MINUTES} minutes max)
                    </span>
                </label>
                <Slider
                    id="minutes"
                    name="minutes"
                    value={[minutes]}
                    min={0}
                    max={MAX_MINUTES}
                    onValueChange={onMinutesChange}
                />
            </div>

            <div className="mt-5 p-2 border rounded">
                <h3 className="text-xl mb-2">Focus time:</h3>
                <div className="text-xl">
                    {formattedTTF}{" "}
                    {hours === 0 ? "minutes" : "hours"}
                </div>
            </div>
        </form>
    );
};
