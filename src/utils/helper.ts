import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export async function getBaseUrl(headersList: ReadonlyHeaders) {
    // O cabeçalho 'x-forwarded-proto' indica o protocolo (http ou https) usado pelo cliente original.
    // O 'host' indica o host (domínio:porta).

    const host = headersList.get('host'); // Ex: 'localhost:3000' ou 'meudominio.com'
    const proto = headersList.get('x-forwarded-proto') || 'http'; // Padrão 'http' para desenvolvimento

    // Constrói a baseURL
    return `${proto}://${host}`;
}

export const getIcon = (index: number) => {
    const icons = ["📚", "🏋️", "📦", "💬", "📝"]; // Ícones para variar
    return icons[index % icons.length];
}

export const getPlacement = (index: number) => {
    const pattern = [1, 0, 2]; // Centro, Esquerda, Direita
    return pattern[index % pattern.length];
}