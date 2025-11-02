import { fetchAPI } from "@/service/interceptor";


export async function loginUser(username: string, password: string) {
    const form = new URLSearchParams()
    form.set('username', username)
    form.set('password', password)
    const options = {
        method: 'POST',
        body: form.toString(),
    }

    return await fetchAPI('/auth/token', options, 'application/x-www-form-urlencoded');
}

export async function logoutUser() {
    return await fetchAPI('/auth', { method: 'DELETE' })
}

export async function getCurrentUser() {
    return await fetchAPI('/user/me', { method: 'GET' })
}