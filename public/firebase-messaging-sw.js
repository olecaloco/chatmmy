importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyAiyoh7Jiq3Lm7z-IECE6TKNUoHDCU6jX0",
    authDomain: "chatmmy-edcbc.firebaseapp.com",
    projectId: "chatmmy-edcbc",
    storageBucket: "chatmmy-edcbc.appspot.com",
    messagingSenderId: "947236783407",
    appId: "1:947236783407:web:8fa4b960d17a3a6b624dda",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);

    // payload.fcmOptions?.link comes from our backend API route handle
    // payload.data.link comes from the Firebase Console where link is the 'key'
    const link = payload.fcmOptions?.link || payload.data?.link;

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: "./pwa-192x192.png",
        data: { url: link },
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
    console.log("[firebase-messaging-sw.js] Notification click received.");

    event.notification.close();

    // This checks if the client is already open and if it is, it focuses on the tab. If it is not open, it opens a new tab with the URL passed in the notification payload
    event.waitUntil(
        clients
            // https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(function (clientList) {
                const url = event.notification.data.url;

                if (!url) return;

                // If relative URL is passed in firebase console or API route handler, it may open a new window as the client.url is the full URL i.e. https://example.com/ and the url is /about whereas if we passed in the full URL, it will focus on the existing tab i.e. https://example.com/about
                for (const client of clientList) {
                    if (client.url === url && "focus" in client) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    console.log("OPENWINDOW ON CLIENT");
                    return clients.openWindow(url);
                }
            })
    );
});
