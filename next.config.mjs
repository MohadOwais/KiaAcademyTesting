const nextConfig = {
    webpack: (config) => {
        // Ensure that nothing is disabling HMR here
        return config;
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: 'https', hostname: 'api.kiacademy.in' },
        ],
        domains: ["res.cloudinary.com", "api.kiacademy.in"],
        unoptimized: true,
    },
};

export default nextConfig;