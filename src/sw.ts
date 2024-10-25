export const register = () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/notificationclick-sw.js", { scope: "/notifclick" })
            .then((registration) => {
                console.log(
                    "Service Worker registered with scope:",
                    registration.scope
                );
            })
            .catch((error) => {
                console.error("Error registering service worker:", error);
            });
    }
};
