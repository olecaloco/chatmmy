import { KeyboardEvent, useId } from "react";
import { ChecklistItem } from "@/models";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface Props {
    item: ChecklistItem;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>, id: number) => void;
    onTextChange: (id: number, value: string) => void;
    onCheckedChange: (id: number, checked: boolean) => void;
}

export const ChecklistFormItem = ({
    item,
    onCheckedChange,
    onTextChange,
    onKeyDown
}: Props) => {
    const id = useId();

    return (
        <div className="flex items-center space-x-2 flex-1">
            <Checkbox
                id={id}
                defaultChecked={item.checked}
                tabIndex={-1}
                onCheckedChange={(checked) =>
                    onCheckedChange(item.id, Boolean(checked))
                }
            />
            <Input
                className="flex-1 border-0"
                value={item.content}
                type="text"
                onKeyDown={(e) => onKeyDown(e, item.id)}
                onChange={(e) => onTextChange(item.id, e.target.value)}
            />
        </div>
    );
};
