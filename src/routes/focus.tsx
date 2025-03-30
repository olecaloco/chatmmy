import { Timer } from "@/components/focus/timer";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/focus")({
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
    component: Focus,
});

function Focus() {
    return (
        <div className="flex-1">
            <div className="bg-yellow-600/80 text-black text-center py-2 mb-5">This is a work in progress</div>
            <Timer />
        </div>
    );
}
