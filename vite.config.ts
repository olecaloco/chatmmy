import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'generateSW',
      srcDir: 'public',
      filename: 'sw.js',
      manifest: {
        name: 'Chatmmy',
        short_name: 'Chatmmy',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#050a18',
        theme_color: '#050a18',
        share_target: {
          action: "/",
          method: "GET",
          params: {
            title: "name",
            text: "description",
            url: "link"
          }
        },
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
