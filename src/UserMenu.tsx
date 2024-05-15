import { UserContext } from "./App.tsx";
import { useContext } from "react";
import { supaClient } from "./supa-client.ts";

export default function UserMenu() {
    const { profile } = useContext(UserContext);

    return (
        <>
            <div className="flex flex-col">
                <h2>Welcome {profile?.username || "dawg"}.</h2>
                <button
                    onClick={() => supaClient.auth.signOut()}
                    className="user-menu-logout-button"
                >
                    Logout
                </button>
            </div>
        </>
    )
}