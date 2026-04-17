import { ModeToggle } from "@/components/mode-toggle";
import { signOut } from "@/helpers/auth";
import { useAuthContext, UserData } from "@/helpers/authContext";
import {
    createRootRouteWithContext,
    Link,
    Outlet,
} from "@tanstack/react-router";
import Icon from "@/assets/icon.svg";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";
import { User } from "firebase/auth";
import { createEmoteHashMap, getEmotes } from "@/lib/api";

interface MyRouterContext {
    user: User | null;
    userData: UserData | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
});

function RootComponent() {
    const { user } = useAuthContext();

    const handleRequestNotification = () => {
        Notification.requestPermission();
    };

    const handleRefreshEmotes = () => {
        getEmotes().then((emotes) => {
            if (!emotes) {
                alert("Something went wrong retrieving the emotes");
                return;
            }

            createEmoteHashMap(emotes);

            window.location.reload();
        });
    };

    return (
        <div className="h-dvh flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
                <span className="flex items-center gap-2">
                    <img
                        src={Icon}
                        alt="Chatmmy"
                        className="h-8 w-8"
                        loading="lazy"
                    />
                </span>

                <nav className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                    <Link activeOptions={{ exact: true }} to="/" title="Chat">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-message-circle-icon lucide-message-circle"
                        >
                            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                        </svg>
                    </Link>
                    <Link to="/checklists" title="Checklist">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-check-icon lucide-list-check"
                        >
                            <path d="M16 5H3" />
                            <path d="M16 12H3" />
                            <path d="M11 19H3" />
                            <path d="m15 18 2 2 4-4" />
                        </svg>
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <SettingsTrigger user={user} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    <ModeToggle />
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleRefreshEmotes}>
                                    Refresh Emotes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleRequestNotification}
                                >
                                    Request Notification
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={signOut}
                                    className="text-red-500"
                                >
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link to={"/signin"}>Sign In</Link>
                    )}
                </div>
            </div>
            <Outlet />
        </div>
    );
}

const SettingsTrigger = ({ user }: { user: User | null }) => {
    if (user && user.photoURL && user.displayName) {
        return (
            <Avatar>
                <AvatarImage src={user.photoURL ?? ""} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>
        );
    }

    return <EllipsisVertical />;
};
