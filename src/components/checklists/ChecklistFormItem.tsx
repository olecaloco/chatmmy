import { ChangeEvent, KeyboardEvent, useId } from "react";
import { ChecklistItem } from "@/models";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface Props {
    item: ChecklistItem;
    index: number;
    setInputRef: any;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>, id: number) => void;
    onTextChange: (id: number, event: ChangeEvent<HTMLInputElement>) => void;
    onCheckedChange: (id: number, checked: boolean) => void;
}

export const ChecklistFormItem = ({
    item,
    index,
    setInputRef,
    onCheckedChange,
    onTextChange,
    onKeyDown,
}: Props) => {
    const id = useId();

    return (
        <div className="flex items-center space-x-2 flex-1">
            <Checkbox
                id={id}
                checked={item.checked}
                tabIndex={-1}
                onCheckedChange={(checked) =>
                    onCheckedChange(item.id, Boolean(checked))
                }
            />
            <Input
                ref={setInputRef(index)}
                className="flex-1 border-0"
                value={item.content}
                type="text"
                onKeyDown={(e) => onKeyDown(e, item.id)}
                onChange={(e) => onTextChange(item.id, e)}
                placeholder="List Item"
            />
        </div>
    );
};
