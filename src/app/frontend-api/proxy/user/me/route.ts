import { NextResponse } from 'next/server'
import { parseCookies } from 'nookies';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET() {
    const { 'ept.token': token } = parseCookies()
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const res = await fetch(`${BACKEND}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    })
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
