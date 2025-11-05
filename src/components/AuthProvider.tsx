'use client'
import React, {createContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {User} from "@/models/models";
import {parseCookies} from 'nookies';

type AuthContextType = {
    isAuthenticated: boolean,
    user: User,
    finishSession: () => Promise<void>
}

// const cookie_name = process.env.EPT_COOKIE_NAME || 'ept.token'
export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }){
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    const isAuthenticated = !!user;

    useEffect(() => {
        const getCurrentUser = async () => {
            const { 'ept.token': token } = parseCookies()
            console.log('token')
            if (!token) {
                setUser(null)
                router.push('/login');
            }

            const res = await fetch('/frontend-api/proxy/user/me', { cache: 'no-store' })
            if (!res.ok) {
                if (res.status === 401) {
                    setUser(null)
                    router.push('/login');
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
