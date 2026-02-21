/* eslint-disable react-refresh/only-export-components */
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
    // Load initial state from local storage to prevent data loss on refresh
    const initialUser = JSON.parse(localStorage.getItem("session")) ?? {
        isLoggedIn: false,
        name: '',
        email: ''
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const [user, setUser] = useState(initialUser);

    const login = async (email, password) => {
        try {
            const result = await fetch(`${API_URL}/api/user/login`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: "include" // Crucial for sending/receiving cookies
            });

            if (result.status !== 200) {
                return false;
            } else {
                const newUser = { isLoggedIn: true, name: '', email: email };
                setUser(newUser);
                localStorage.setItem("session", JSON.stringify(newUser)); // Persistent state
                return true;
            }
        } catch (error) {
            console.error("Login Error: ", error);
            return false;
        }
    };

    const logout = async () => {
        await fetch(`${API_URL}/api/user/logout`, {
            method: "POST",
            credentials: "include"
        });
        const newUser = { isLoggedIn: false, name: '', email: '' };
        setUser(newUser);
        localStorage.removeItem("session"); // Clear local storage
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}