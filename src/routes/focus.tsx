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
    return <div className="px-4">Hello "/focus"!</div>;
}
