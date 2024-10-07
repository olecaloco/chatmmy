import { Emote_API } from "@/models";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";

export const Suggestions = ({
    suggestions,
    onSuggestionClick,
}: {
    suggestions: Emote_API[];
    onSuggestionClick: (name: string) => void;
}) => {
    return (
        <div className="mt-4 w-full p-2 bg-background border bg-muted">
            <small className="p-2 font-bold text-muted-foreground">
                Matched emotes
            </small>
            <ScrollArea
                className={"[&>[data-radix-scroll-area-viewport]]:max-h-40 "}
            >
                {suggestions.map((s) => (
                    <Button
                        className="w-full rounded-sm justify-start"
                        variant={"ghost"}
                        onClick={() => onSuggestionClick(s.name)}
                        title={s.name}
                        key={s.id}
                    >
                        <span className="flex items-center gap-2">
                            <img
                                src={`${s.data.host.url}/${s.data.host.files[1].name}`}
                                alt={s.name}
                            />
                            :{s.name}:
                        </span>
                    </Button>
                ))}
            </ScrollArea>
        </div>
    );
};
