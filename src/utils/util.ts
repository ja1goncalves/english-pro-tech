import { headers } from 'next/headers';

export async function getBaseUrl() {
    // Obtém os cabeçalhos da requisição
    const headersList = await headers();

    // O cabeçalho 'x-forwarded-proto' indica o protocolo (http ou https) usado pelo cliente original.
    // O 'host' indica o host (domínio:porta).

    const host = headersList.get('host'); // Ex: 'localhost:3000' ou 'meudominio.com'
    const proto = headersList.get('x-forwarded-proto') || 'http'; // Padrão 'http' para desenvolvimento

    // Constrói a baseURL
    return `${proto}://${host}`;
}