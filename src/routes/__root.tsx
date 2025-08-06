import { ModeToggle } from "@/components/mode-toggle";
import { signOut } from "@/helpers/auth";
import { useAuthContext } from "@/helpers/authContext";
import {
    createRootRouteWithContext,
    Link,
    Outlet,
    useLocation,
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

interface MyRouterContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any; //Make this any kind of user type
    userData: any;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
});

function RootComponent() {
    const [open, setOpen] = useState(false);
    const { user } = useAuthContext();
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
    }, [location]);

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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-[300px]" side="left">
                <SheetHeader>
                    <SheetTitle>Chatmmy</SheetTitle>
                    <SheetDescription>The best chat for Chammy and Olie</SheetDescription>
                </SheetHeader>
                <nav className="mt-5 flex flex-col gap-4">
                    <Link to="/">Chat</Link>
                    <Link to="/checklists" search={{ id: undefined }}>Checklists</Link>
                </nav>
            </SheetContent>

            <div className="h-dvh flex flex-col">
                <div className="p-4 flex items-center justify-between border-b">

                    <span className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(true)}>
                        <img
                            src={Icon}
                            alt="Chatmmy"
                            className="h-8 w-8"
                            loading="lazy"
                        />
                        Chatmmy
                    </span>

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
                                    <DropdownMenuItem
                                        onClick={handleRefreshEmotes}
                                    >
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
        </Sheet>
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
