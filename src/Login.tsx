import Dialog from "./Dialog";
import { useContext, useEffect, useRef, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supaClient } from "./supa-client.ts";
import { UserContext } from "./App.tsx";

export const setReturnPath = () => {
    localStorage.setItem("returnPath", window.location.pathname);
}

export default function Login() {
    const [showModal, setShowModal] = useState(false);
    const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
    const { session } = useContext(UserContext);

    const dialog = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session?.user) {
            setShowModal(false);
        }
    }, [session]);

    return (
        <>
            <div className="flex m-4 place-items-center">
                <button
                    className="login-button"
                    onClick={ () => {
                        setShowModal(true);
                        setAuthMode("sign_in")
                        setReturnPath()
                    } }
                >
                    Login
                </button>
                <span className="p-2"> or </span>{ " " }
                <button
                    className="login-button"
                    onClick={ () => {
                        setShowModal(true);
                        setAuthMode("sign_up")
                        setReturnPath()
                    } }
                >
                    Sign Up
                </button>
            </div>
            <Dialog
                open={ showModal }
                dialogStateChange={ (open) => setShowModal(open) }
                contents={
                <>
                    {
                        <Auth
                            supabaseClient={ supaClient }
                            appearance={{
                                theme: ThemeSupa,
                                className: {
                                    container: "login-form-container",
                                    label: "login-form-label",
                                    button: "login-form-button",
                                    input: "login-form-input",
                                },
                            }}
                            view={ authMode }
                        />
                    }
                    <button onClick={ () => setShowModal(false) }>Close</button>
                </> }
            />
        </>
    )
}