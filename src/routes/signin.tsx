import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmailPassword } from '@/helpers/auth'
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

        try {
            await signInWithEmailPassword(email, password);
        } catch (e) {
            setLoading(false);
        }
        
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
        </div>
    )
}