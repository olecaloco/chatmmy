import { ChecklistForm } from "@/components/checklists/ChecklistForm";
import { Button } from "@/components/ui/button";
import { deleteChecklist, getChecklist } from "@/lib/api";
import { Checklist } from "@/models";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/checklists/$id")({
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

    const updateLoadingState = (newLoadingState: boolean) => {
        setLoading(newLoadingState);
    };

    const onDeleteChecklist = async () => {
        if (deleting) return;
        if (!checklist) return;

        const conf = confirm(
            `Are you sure you want to delete ${checklist.title}`
        );

        if (!conf) return;

        setDeleting(true);

        if (checklist.id) await deleteChecklist(checklist.id);

        navigate({ to: "/checklists" });
    };

    return (
        <div className="flex flex-col flex-1 justify-between px-4 pb-4 overflow-hidden">
            <ChecklistForm
                id={checklist?.id}
                checklist={checklist}
                loading={loading}
                updateLoadingState={updateLoadingState}
            />
            <div className="flex items-center justify-between">
                <Button
                    className="text-red-700"
                    variant="ghost"
                    disabled={deleting}
                    type="button"
                    onClick={onDeleteChecklist}
                >
                    {deleting ? (
                        <Loader2Icon className="animate-spin" />
                    ) : (
                        "Delete"
                    )}
                </Button>
                <div className="flex gap-1">
                    <Button variant="ghost" asChild>
                        <Link to="/checklists">Back</Link>
                    </Button>
                    <Button
                        disabled={loading}
                        type="submit"
                        form={checklist?.id}
                    >
                        {loading ? (
                            <Loader2Icon className="animate-spin" />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
