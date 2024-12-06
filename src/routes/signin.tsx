import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmailPassword, signInWithGoogle } from '@/helpers/auth'
import { useAuthContext } from '@/helpers/authContext';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute('/signin')({
    beforeLoad: ({ context, location }) => {
        if (context.user.user) {
            throw redirect({
                to: "/",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: SignIn
})

function SignIn() {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const email = emailInputRef.current?.value || "";
        const password = passwordInputRef.current?.value || "";

        if (!email || !password) return;
        if (loading) return;

        setLoading(true);

        await signInWithEmailPassword(email, password);
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword(p => !p);
    }

    useEffect(() => {
        if (user !== null) navigate({ to: "/" });
    }, [navigate, user]);

    return (
        <div className="flex flex-col space-y-5 items-center justify-center flex-1">
            <form className="w-96 max-w-full px-2" onSubmit={handleSubmit}>
                <div className="mb-2">
                    <Input ref={emailInputRef} placeholder="Email" type="email" required />
                </div>
                <div className="relative mb-2">
                    <Input className="pr-10" ref={passwordInputRef} placeholder="Password" type={showPassword ? "text" : "password"} required />
                    <Button className="absolute top-0 right-0 z-10 rounded-full" variant="ghost" size="icon" type="button" onClick={handleTogglePasswordVisibility}>
                        {!showPassword && <Eye className="w-4 h-4" />}
                        {showPassword && <EyeOff className="w-4 h-4" />}
                    </Button>
                </div>
                <Button className="block w-full" disabled={loading} type="submit">Login</Button>
            </form>
            <div className="text-muted-foreground">OR</div>
            <button onClick={signInWithGoogle} className="gsi-material-button">
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ "display": "block" }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                    </div>
                    <span className="gsi-material-button-contents">Sign in with Google</span>
                    <span style={{ "display": "none" }}>Sign in with Google</span>
                </div>
            </button>
        </div>
    )
}