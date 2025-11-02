import { NextResponse } from 'next/server'
import { getCurrentUser } from "@/service/user";


export async function GET() {
    const res = await getCurrentUser()

    if (res.ok) {
        const data = await res.json()
        localStorage.setItem('eptCurrentUser', data);
    }

    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
