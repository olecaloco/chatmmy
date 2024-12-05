import { useEffect, useRef, useState } from "react";
import { fetchToken } from "@/firebase";
import { toast } from "sonner";

async function getNotificationPermissionAndToken() {
    // Step 1: Check if Notifications are supported in the browser.
    if (!("Notification" in window)) {
        console.info("This browser does not support desktop notification");
        alert("This browser does not support desktop notification")
        return null;
    }

    // Step 2: Check if permission is already granted.
    if (Notification.permission === "granted") {
        return await fetchToken();
    }

    // Step 3: If permission is not denied, request permission from the user.
    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    toast("Notification permission not granted.");
    console.log("Notification permission not granted.");
    return null;
}

const useFcmToken = () => {
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission | null>(null); // State to store the notification permission status.
    const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
    const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
    const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

    const loadToken = async () => {
        // Step 4: Prevent multiple fetches if already fetched or in progress.
        if (isLoading.current) return;

        isLoading.current = true; // Mark loading as in progress.
        const token = await getNotificationPermissionAndToken(); // Fetch the token.

        // Step 5: Handle the case where permission is denied.
        if (Notification.permission === "denied") {
            setNotificationPermissionStatus("denied");
            toast("Push Notifications issue - permission denied")
            console.info(
                "%cPush Notifications issue - permission denied",
                "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
            );
            isLoading.current = false;
            return;
        }

        // Step 6: Retry fetching the token if necessary. (up to 3 times)
        // This step is typical initially as the service worker may not be ready/installed yet.
        if (!token) {
            if (retryLoadToken.current >= 3) {
                toast("Unable to load token, refresh the browser");
                toast("Push Notifications issue - unable to load token after 3 retries");
                console.info(
                    "%cPush Notifications issue - unable to load token after 3 retries",
                    "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
                );
                isLoading.current = false;
                return;
            }

            retryLoadToken.current += 1;
            console.error("An error occurred while retrieving token. Retrying...");
            toast("An error occurred while retrieving token. Retrying...")
            isLoading.current = false;
            await loadToken();
            return;
        }

        // Step 7: Set the fetched token and mark as fetched.
        setNotificationPermissionStatus(Notification.permission);
        setToken(token);
        isLoading.current = false;
    };

    useEffect(() => {
        // Step 8: Initialize token loading when the component mounts.
        if ("Notification" in window) {
            loadToken();
        }
    }, []);

    return { token, notificationPermissionStatus }; // Return the token and permission status.
};

export default useFcmToken;