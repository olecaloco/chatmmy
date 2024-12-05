import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import './index.css'
import { AuthContextProvider, useAuthContext } from './helpers/authContext'
import { ThemeProvider } from './components/theme-provider'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    user: undefined,
    userData: undefined
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const user = useAuthContext();
  return <RouterProvider router={router} context={{ user }} />;
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthContextProvider>
          <InnerApp />
        </AuthContextProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
