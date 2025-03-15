import { useId } from "react";
import { ChecklistItem } from "@/models";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";

interface Props {
    item: ChecklistItem;
    onCheckedChange: (id: number, checked: boolean) => void;
    onItemRemove: (id: number) => void;
}

export const ChecklistFormItem = ({
    item,
    onCheckedChange,
    onItemRemove,
}: Props) => {
    const id = useId();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={id}
                    defaultChecked={item.checked}
                    onCheckedChange={(checked) =>
                        onCheckedChange(item.id, Boolean(checked))
                    }
                />
                <label htmlFor={id} className="">
                    {item.content}
                </label>
            </div>
            <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => onItemRemove(item.id)}
            >
                <XIcon className="w-5 h-5 text-red-700" />
            </Button>
        </div>
    );
};
