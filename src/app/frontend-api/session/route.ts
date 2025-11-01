import { parseCookies, setCookie } from 'nookies';
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
const COOKIE_NAME = 'auth_token'

function makeCookie(token: string) {
    const isProd = process.env.NODE_ENV === 'production'
    const maxAge = 60
    setCookie(undefined, 'engsoft.token', token, {
        maxAge,
        path: '/',
        secure: isProd,
        sameSite: 'lax',
    });
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || ''
        let username = ''
        let password = ''

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const body = await req.text()
            const params = new URLSearchParams(body)
            username = params.get('username') || ''
            password = params.get('password') || ''
        } else if (contentType.includes('application/json')) {
            const body = await req.json()
            username = body.username || ''
            password = body.password || ''
        } else if (contentType.includes('multipart/form-data')) {
            const form = await req.formData()
            username = String(form.get('username') || '')
            password = String(form.get('password') || '')
        }

        if (!username || !password) {
            return NextResponse.json({ message: 'username and password are required' }, { status: 400 })
        }

        const form = new URLSearchParams()
        form.set('username', username)
        form.set('password', password)

        const res = await fetch(`${BACKEND}/api/v1/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString(),
        })

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json({ message: text || 'Invalid credentials' }, { status: res.status })
        }

        const data = await res.json()
        const token = data?.access_token as string
        if (!token) {
            return NextResponse.json({ message: 'No token received' }, { status: 502 })
        }
        makeCookie(token)
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ message: e?.message || 'Login failed' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { 'ept.token': token } = parseCookies()

        // Try to logout in backend if we have a token
        if (token) {
            await fetch(`${BACKEND}/api/v1/auth`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {})
        }

        const res = NextResponse.json({ ok: true })
        res.headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
        return res
    } catch (e: any) {
        const res = NextResponse.json({ ok: true })
        res.headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
        return res
    }
}
