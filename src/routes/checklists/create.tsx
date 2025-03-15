import { ChecklistForm } from "@/components/checklists/ChecklistForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/checklists/create")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onOpenChange = () => {
        navigate({ to: "/checklists" });
    };

    const updateLoadingState = (newLoadingState: boolean) => {
        setLoading(newLoadingState);
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new checklist</DialogTitle>
                </DialogHeader>
                <ChecklistForm
                    loading={loading}
                    updateLoadingState={updateLoadingState}
                />
            </DialogContent>
        </Dialog>
    );
}
