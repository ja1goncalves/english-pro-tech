import { fetchAPI } from "@/service/interceptor";


export async function getRolePlays() {
    return await fetchAPI('/role-play', { method: 'GET' });
}

export async function playTask(roleId: string, level: number, playCode: string, answer?: string) {
    const options = {
        method: 'POST',
        body: JSON.stringify({
            role_id: roleId,
            level_num: level,
            play_code: playCode,
            answer
        })
    }
    return await fetchAPI('/role-play', options)
}