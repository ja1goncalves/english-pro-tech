import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { loginUser, logoutUser } from "@/service/user";

const cookie_name = process.env.EPT_COOKIE_NAME || 'ept.token'

async function makeCookie(token: string) {
    (await cookies()).set(cookie_name, token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60,
        path: '/'
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

        const res = await loginUser(username, password)

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json({ message: text || 'Invalid credentials' }, { status: res.status })
        }

        const data = await res.json()
        const token = data?.access_token as string
        if (!token) {
            return NextResponse.json({ message: 'No token received' }, { status: 502 })
        }
        await makeCookie(token)

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ message: e?.message || 'Login failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = (await cookies()).get(cookie_name)?.value

        if (token) {
            await logoutUser()
            // const response = NextResponse.redirect(new URL('/', request.url))
            // response.cookies.delete(cookie_name)
        }

        (await cookies()).delete(cookie_name);
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        (await cookies()).delete(cookie_name);
        return NextResponse.json({ ok: true })
    }
}
