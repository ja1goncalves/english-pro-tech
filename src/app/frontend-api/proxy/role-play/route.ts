import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
const COOKIE_NAME = 'ept.token'

async function authHeader() {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token) return null
    return { Authorization: `Bearer ${token}` }
}

export async function GET() {
    const headers = await authHeader()
    if (!headers) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const res = await fetch(`${BACKEND}/api/v1/role-play/`, { headers })
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

export async function POST(req: NextRequest) {
    const headers = await authHeader()
    if (!headers) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const body = await req.text()
    const res = await fetch(`${BACKEND}/api/v1/role-play/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
    })
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
