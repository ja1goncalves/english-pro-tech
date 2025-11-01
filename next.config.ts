import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        // Proxy API requests to FastAPI backend in development to avoid CORS
        const backend = process.env.BACKEND_URL || 'http://localhost:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${backend}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
