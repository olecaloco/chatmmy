// This works only if you host the app via Firebase Hosting
// Check https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js for a custom implementation
importScripts('/__/firebase/10.13.0/firebase-app-compat.js');
importScripts('/__/firebase/10.13.0/firebase-messaging-compat.js');
importScripts('/__/firebase/init.js');

const messaging = firebase.messaging();