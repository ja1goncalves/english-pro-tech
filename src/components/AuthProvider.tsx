'use client'
import React, {createContext, useEffect, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {User} from "@/models/models";
import {parseCookies} from 'nookies';

type AuthContextType = {
    isAuthenticated: boolean,
    user: User,
    finishSession: () => Promise<void>
}

const FREE_ROUTES = ["/login", "/sign-up"]

// const cookie_name = process.env.EPT_COOKIE_NAME || 'ept.token'
export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }){
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()
    const pathname = usePathname();

    const isAuthenticated = !!user;

    const isFreeRoute = () => !FREE_ROUTES.includes(pathname);
    const redirectToLogin = () => {
        setUser(null)
        if (isFreeRoute())
            router.push('/login');
    }

    useEffect(() => {
        const getCurrentUser = async () => {
            const { 'ept.token': token } = parseCookies()
            if (!token) {
                redirectToLogin()
            }

            const res = await fetch('/frontend-api/proxy/user/me', { cache: 'no-store' })
            if (!res.ok) {
                if (res.status === 401) {
                    redirectToLogin()
                } else {
                    const text = await res.text()
                    throw new Error(text || `Failed to load roles (${res.status})`)
                }
            }
            const data = (await res.json()) as User
            setUser(data)
        }

        if (!user) {
            getCurrentUser()
        }
    },[user, router])

    async function finishSession() {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user: user as User,
            isAuthenticated,
            finishSession
        }}>
            {children}
        </AuthContext.Provider>
    );
}
