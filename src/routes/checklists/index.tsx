import { Button } from "@/components/ui/button";
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    deleteChecklist,
    getChecklistsSnapshot,
    saveChecklist,
} from "@/lib/api";
import { Checklist } from "@/models";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { EllipsisIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/checklists/")({
    beforeLoad: ({ context, location }) => {
        if (!context.user.user) {
            throw redirect({
                to: "/signin",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: Checklists,
});

function Checklists() {
    const [checklists, setChecklist] = useState<Checklist[]>([]);

    useEffect(() => {
        const unsubscribe = getChecklistsSnapshot((snapshot) => {
            if (snapshot.empty) {
                setChecklist([]);
                return;
            }

            const data = snapshot.docs.map((d) => d.data());
            setChecklist(data);
        });

        return () => unsubscribe();
    }, []);

    const handleDuping = async (checklist: Checklist) => {
        const dupe = {
            title: checklist.title,
            items: checklist.items,
            createdAt: new Date().getTime(),
            createdBy: checklist.createdBy,
        };

        saveChecklist(dupe);
    };

    const handleDelete = async (checklist: Checklist) => {
        if (!checklist.id) return;

        const confirmation = window.confirm(
            `Are you sure you want to delete the checklist "${checklist.title}"? This action cannot be undone.`,
        );

        if (!confirmation) return;

        await deleteChecklist(checklist.id);
    };

    const hasChecklist = checklists.length > 0 ? true : false;

    const isAllChecked = (checklist: Checklist): boolean => {
        return checklist.items.every((item) => item.checked);
    };

    return (
        <div className="flex flex-1 flex-col px-3 pb-4 mt-4 gap-4 overflow-y-hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl">Checklists</h1>
                <Button asChild>
                    <Link to="/checklists/create">
                        <PlusIcon /> Add new
                    </Link>
                </Button>
            </div>

            {hasChecklist && (
                <div className="flex-1 -mx-3 overflow-y-auto max-h-full">
                    <ul className="px-4 space-y-2">
                        {checklists.map((checklist) => (
                            <li
                                className="flex space-between items-center px-2 py-1 shadow-sm bg-muted rounded"
                                key={checklist.id}
                            >
                                <div className="flex-1">
                                    <Link
                                        to="/checklists/$id"
                                        params={{ id: checklist.id! }}
                                    >
                                        <h4>{checklist.title}</h4>
                                        <span className="block text-muted-foreground text-sm">
                                            {format(
                                                checklist.createdAt,
                                                "MMMM dd, yyyy",
                                            )}
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
                                            src="https://cdn.7tv.app/emote/01H8K7GGEG00026Q8KSZWQ392W/1x.webp"
                                            alt="Incomplete"
                                            className="w-10"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <EllipsisIcon />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDuping(checklist)
                                                }
                                            >
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-500"
                                                onClick={() =>
                                                    handleDelete(checklist)
                                                }
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
