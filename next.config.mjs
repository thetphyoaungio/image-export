/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        //domains: ['img-demo-next-dev.s3.amazonaws.com', 'localhost'],
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'img-demo-next-dev.s3.amazonaws.com',
              pathname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'img-demo-next-dev.s3.ap-southeast-1.amazonaws.com',
                pathname: '**'
            }
        ],
    },
};

export default nextConfig;