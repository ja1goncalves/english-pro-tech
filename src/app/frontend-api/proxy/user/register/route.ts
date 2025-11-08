import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from "@/service/user";
import { User } from "@/models/models";

export async function POST(req: NextRequest) {
    const body = await req.json()
    const res = await registerUser(body as User)

    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
