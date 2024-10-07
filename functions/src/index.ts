import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from "firebase-functions/v2/https";
import { onDocumentCreatedWithAuthContext } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

interface SaveTokenData {
    userId?: string;
    token: string;
}


export const saveToken = onCall({ region: "asia-southeast1" }, async (request: CallableRequest<SaveTokenData>) => {
    const data = request.data;
    const token = data.token;
    const userId = request.auth?.uid;

    if (!userId) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    if (!token) {
        throw new HttpsError('invalid-argument', 'The function must be called with a token.');
    }


    try {
        // Insert your logic to determine your desired topic here
        const userIdTopic = "xxxxx";

        const userDoc = await admin.firestore().doc(`users/${userId}`).get();
        if (!userDoc.exists) throw new Error("User does not exists");

        const data = userDoc.data();

        if (!data) throw new Error(`No data exists for user: ${userId}`);
        const tokenSet = new Set([...data.tokens, token]);
        const tokens = [...tokenSet];

        logger.info('User UID:', userId);
        logger.info('User Tokens', tokens);

        await admin.messaging().subscribeToTopic(tokens, userIdTopic);
        await admin.firestore().doc(`users/${userId}`).set({ tokens: tokens }, { merge: true });

        logger.info('Subscribed to topic:', userIdTopic);

        return { success: true };
    } catch (error) {
        console.error('Error saving token:', error);
        throw new HttpsError('internal', 'Unable to save token.');
    }
});

export const onMessageCreate = onDocumentCreatedWithAuthContext({
    document: "messages/{messageId}",
    region: "asia-southeast1",
}, async (event) => {
    const snapshot = event.data;
    const userId = event.authId;

    if (!snapshot) {
        logger.error('No data associated with the event.');
        return;
    }

    const data = snapshot.data();

    // Replace with your own topic
    // Feel free to add some logic to determine in which topic to send the notification.
    let topicId = "xxxxx";

    logger.info({
        senderId: userId,
        topicId,
        message: data.content || ""
    })

    try {
        // Send the notification
        const response = await admin.messaging().send({
            notification: {
                title: 'New Message',
                body: data.content || 'You have a new message',
            },
            webpush: {
                fcmOptions: {
                    link: "https://mysite.com" // Replace with your site link
                }
            },
            topic: topicId,
        });

        logger.debug(response);

        logger.info('Notification sent successfully:', response);
    } catch (error) {
        logger.error('Error sending notification:', error);
    }
});