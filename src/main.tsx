import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { AuthContextProvider, useAuthContext } from "./helpers/authContext";
import { ThemeProvider } from "./components/theme-provider";
import { EmoteContextProvider } from "./contexts/EmoteContextProvider";

// Create a new router instance
const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: {
        user: null,
        userData: null,
    },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function InnerApp() {
    const { user, userData } = useAuthContext();
    return <RouterProvider router={router} context={{ user, userData }} />;
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <AuthContextProvider>
                    <EmoteContextProvider>
                        <InnerApp />
                    </EmoteContextProvider>
                </AuthContextProvider>
            </ThemeProvider>
        </StrictMode>,
    );
}
