/** @type {import('next').NextConfig} */
const nextConfig = {
    devServer: {
        port: 3002, // Thiết lập cổng mong muốn
    },
    images: {
        domains: [
            "kxxtqpsnzabzlumnmmla.supabase.co"
        ]
    }
};

export default nextConfig;
