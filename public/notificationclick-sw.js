self.addEventListener("notificationclick", (event) => {
    event.notification.close(); // Close the notification

    const url = event.notification.data?.url || "https://chatmmy-edcbc.web.app"; // Default URL if not provided

    event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
            const client = clientList.find(
                (c) => c.url === url && "focus" in c
            );
            if (client) {
                return client.focus(); // Focus the existing window if found
            }
            return clients.openWindow(url); // Open a new window if not found
        })
    );
});
