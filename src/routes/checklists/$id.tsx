import { ChecklistForm } from "@/components/checklists/ChecklistForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { deleteChecklist, getChecklist } from "@/lib/api";
import { Checklist } from "@/models";
import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/checklists/$id")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { id } = useParams({ from: "/checklists/$id" });
    const [checklist, setChecklist] = useState<Checklist | undefined>(
        undefined
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    useEffect(() => {
        getChecklist(id).then((data) => {
            setChecklist(data);
        });
    }, [id]);

    const onOpenChange = () => {
        if (loading) return;

        navigate({ to: "/checklists" });
    };

    const updateLoadingState = (newLoadingState: boolean) => {
        setLoading(newLoadingState);
    };

    const onDeleteChecklist = async () => {
        if (deleting) return;

        setDeleting(true);

        if (checklist && checklist.id) await deleteChecklist(checklist.id);

        navigate({ to: "/checklists" });
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update checklist</DialogTitle>
                </DialogHeader>
                <ChecklistForm
                    id={checklist?.id}
                    checklist={checklist}
                    loading={loading}
                    updateLoadingState={updateLoadingState}
                />
                <DialogFooter>
                    <Button
                        className="mt-10 w-[150px]"
                        variant="destructive"
                        disabled={deleting}
                        onClick={onDeleteChecklist}
                    >
                        {deleting ? <Loader2Icon className="animate-spin" /> : "Delete Checklist"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
