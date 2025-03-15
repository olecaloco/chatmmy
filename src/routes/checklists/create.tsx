import { ChecklistForm } from "@/components/checklists/ChecklistForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
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
                    id="createForm"
                    loading={loading}
                    updateLoadingState={updateLoadingState}
                />
                <DialogFooter>
                    <Button disabled={loading} type="submit" form="createForm">
                        {loading ? (
                            <Loader2Icon className="animate-spin" />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
