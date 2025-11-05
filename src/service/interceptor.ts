import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const urlBase = process.env.EPT_API_URL || 'http://localhost:8000';
const cookie_name = process.env.EPT_COOKIE_NAME || 'ept.token'

async function authHeader(contentType: string) {
    const token = (await cookies()).get(cookie_name)?.value

    return {
        'Content-Type': contentType,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
}

export async function fetchAPI(endpoint: string, options = {}, contentType = 'application/json') {
    const url = `${urlBase}/api/v1${endpoint}`;
    const headers = await authHeader(contentType);
    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            const text = contentType && contentType.includes("application/json")
                ? (await response.json()).detail
                : await response.text()

            if (response.status === 401) {
                (await cookies()).delete(cookie_name);
                console.log('Unauthorized: Session expired or invalid token.');
            } else if (response.status === 500) {
                if (typeof window !== 'undefined' && text) {
                    alert(text);
                }
                console.log(`Server Error (500): ${text || 'Unknown 500 error'}`);
            } else {
                console.log(text || `HTTP Error: ${response.statusText}`);
            }
            return NextResponse.json({ message: text || 'Invalid credentials' }, { status: response.status })
        }

        return NextResponse.json(await response.json())
    } catch (error) {
        return NextResponse.json({ message: 'Fetch API Error: ' + error }, { status: 500 })
    }
}