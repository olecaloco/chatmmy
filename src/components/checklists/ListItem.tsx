import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checklist } from "@/models";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { EllipsisIcon } from "lucide-react";

interface Props {
    checklist: Checklist;
    togglePin: (checklist: Checklist) => void;
    handleDuping: (checklist: Checklist) => void;
    handleDelete: (checklist: Checklist) => void;
}

export const ChecklistListItem = ({
    checklist,
    togglePin,
    handleDuping,
    handleDelete,
}: Props) => {
    const isAllChecked = (checklist: Checklist): boolean => {
        return checklist.items.every((item) => item.checked);
    };

    return (
        <li
            className="flex space-between items-center px-2 py-1 shadow-sm bg-muted rounded"
            key={checklist.id}
        >
            <div className="flex-1">
                <Link to="/checklists/$id" params={{ id: checklist.id! }}>
                    <h4>{checklist.title}</h4>
                    <span className="block text-muted-foreground text-sm">
                        {format(checklist.createdAt, "MMMM dd, yyyy")}
                    </span>
                </Link>
            </div>
            <div className="flex items-center gap-1">
                {isAllChecked(checklist) && (
                    <img
                        loading="lazy"
                        src="https://cdn.7tv.app/emote/01GB4E5CB0000BJ5HR8F6XV9A0/1x.webp"
                        alt="Complete"
                        className="w-10"
                    />
                )}
                {!isAllChecked(checklist) && (
                    <img
                        loading="lazy"
                        src="https://cdn.7tv.app/emote/01H6SKVTWR00049XSVR28FKPP6/1x.webp"
                        alt="Incomplete"
                        className="w-10"
                    />
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <EllipsisIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => togglePin(checklist)}>
                            {checklist.pinned ? "Unpin" : "Pin to top"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDuping(checklist)}
                        >
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(checklist)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </li>
    );
};
