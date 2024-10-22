import { ModeToggle } from "@/components/mode-toggle";
import { signOut } from "@/helpers/auth";
import { useAuthContext } from "@/helpers/authContext";
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
// import { Switch } from "@/components/ui/switch";
// import { setupNotifications } from "@/firebase";
import { getEmotes } from "@/lib/api";

interface MyRouterContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any; //Make this any kind of user type
    userData: any;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
});

function RootComponent() {
    const { user } = useAuthContext();

    const handleRefreshEmotes = () => {
        getEmotes((response) => {
            window.localStorage.setItem("emotes", JSON.stringify(response.emotes));
            window.location.reload();
        });
    };

    return (
        <div className="h-dvh flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
                <Link to="/" className="[&.active]:font-bold">
                    <span className="flex items-center gap-2">
                        <img src={Icon} alt="Chatmmy" className="h-8 w-8" />
                        Chatmmy
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="onesignal-customlink-container"></div>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <SettingsTrigger user={user} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    <ModeToggle />
                                </DropdownMenuLabel>
                                {/* <DropdownMenuLabel>
                                    <NotificationTrigger userData={userData} />
                                </DropdownMenuLabel> */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleRefreshEmotes}>
                                    Refresh Emotes
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

// const NotificationTrigger = ({ userData }: { userData: any }) => {
//     const token = window.localStorage.getItem("token");
//     let defaultChecked = false;

//     if (
//         userData &&
//         token &&
//         userData.tokens.includes(token)
//     ) {
//         defaultChecked = true;
//     }

//     const handleOnCheckChange = (value: boolean) => {
//         if (value) {
//             setupNotifications();
//         } else {
//             return;
//         }
//     }

//     return (
//         <div className="flex items-center space-between gap-4">
//             <span className="flex-1">Notification</span>
//             <Switch defaultChecked={defaultChecked} onCheckedChange={handleOnCheckChange} />
//         </div>
//     )
// }

const SettingsTrigger = ({ user }: { user: User | null }) => {
    if (user && user.photoURL && user.displayName) {
        return (
            <Avatar>
                <AvatarImage src={user.photoURL ?? ""} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>
        );
    }

    return (        
        <EllipsisVertical />
    );
};
