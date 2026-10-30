import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        agentFeedback: true,
        serverComponentsHmrCache: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/jrgj4nug/image/upload/**",
            },
        ],
    },
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    allowedDevOrigins: ['62.171.163.24:10333'],
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
