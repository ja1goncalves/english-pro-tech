import { NextResponse } from 'next/server'
import { getCurrentUser } from "@/service/user";


export async function GET() {
    const res = await getCurrentUser()

    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
