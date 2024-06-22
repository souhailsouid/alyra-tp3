/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard/voters',
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
