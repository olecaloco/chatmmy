import { ChecklistForm } from "@/components/checklists/ChecklistForm";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/checklists/create")({
    component: RouteComponent,
});

function RouteComponent() {
    const [loading, setLoading] = useState(false);

    const updateLoadingState = (newLoadingState: boolean) => {
        setLoading(newLoadingState);
    };

    return (
        <div className="flex flex-col flex-1 justify-between px-4 pb-4 overflow-hidden">
            <ChecklistForm
                id="createForm"
                loading={loading}
                updateLoadingState={updateLoadingState}
            />

            <div className="flex justify-end gap-1">
                <Button variant="ghost" asChild>
                    <Link to="/checklists">Back</Link>
                </Button>
                <Button disabled={loading} type="submit" form="createForm">
                    {loading ? <Loader2Icon className="animate-spin" /> : "Save"}
                </Button>
            </div>
        </div>
    );
}
