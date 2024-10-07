# Chatmmy
A custom and basic PWA chat app with 7TV emotes. Made using Vite with PWA Asset Generator

## Stack
- React
- Tanstack Router
- @use-gestures
- @react-spring/web
- tailwindcss
- shadcn/ui
- Firebase
    - Firestore
    - Auth (Google)
    - Messaging (Notifications)
    - Functions

## Features
- Real-time updates using Firestore (onSnapshot)
- 7tv emote support. Suggestions appear using colon (:) delimiter
- Notification Support*

* iOS unregisters token for notifications: https://github.com/firebase/firebase-js-sdk/issues/8010