import { ChecklistListItem } from "@/components/checklists/ListItem";
import { Button } from "@/components/ui/button";
import {
    deleteChecklist,
    getChecklistsSnapshot,
    getPinnedChecklists,
    saveChecklist,
} from "@/lib/api";
import { Checklist } from "@/models";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
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
    const [pinnedChecklists, setPinnedChecklists] = useState<Checklist[]>([]);

    useEffect(() => {
        const unsubscribe = getChecklistsSnapshot((snapshot) => {
            if (snapshot.empty) {
                setChecklist([]);
                return;
            }

            const data = snapshot.docs
                .map((d) => d.data())
                .filter((checklist) => !checklist.pinned);

            setChecklist(data);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = getPinnedChecklists((snapshot) => {
            if (snapshot.empty) {
                setPinnedChecklists([]);
                return;
            }

            const data = snapshot.docs.map((d) => d.data());
            setPinnedChecklists(data);
        });

        return () => unsubscribe();
    }, []);

    const togglePin = async (checklist: Checklist) => {
        if (!checklist.id) return;

        const updatedChecklist = {
            ...checklist,
            pinned: !checklist.pinned,
        };

        await saveChecklist(updatedChecklist, checklist.id);
    };

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

    const hasPinnedChecklists = pinnedChecklists.length > 0 ? true : false;
    const hasChecklists = checklists.length > 0 ? true : false;

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

            {hasChecklists && (
                <div className="flex-1 -mx-3 overflow-y-auto max-h-full">
                    {hasPinnedChecklists && (
                        <div className="px-4 mb-4">
                            <div className="text-white/50 mb-1">Pinned</div>
                            <ul className="space-y-2">
                                {pinnedChecklists.map((checklist) => (
                                    <ChecklistListItem
                                        key={checklist.id}
                                        checklist={checklist}
                                        togglePin={togglePin}
                                        handleDuping={handleDuping}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="px-4 mb-4">
                        <div className="text-white/50 mb-1">Items</div>
                        <ul className="space-y-2">
                            {checklists.map((checklist) => (
                                <ChecklistListItem
                                    key={checklist.id}
                                    checklist={checklist}
                                    togglePin={togglePin}
                                    handleDuping={handleDuping}
                                    handleDelete={handleDelete}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
