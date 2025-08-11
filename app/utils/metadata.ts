import type { Metadata } from "next";

const title = "KI Academy";
const description = "Streamline online education with our powerful Learning Management System (LMS). Create, manage, and track courses effortlessly. Ideal for schools, universities, and businesses, it offers interactive learning, mobile access, and detailed analytics. Enhance your e-learning experience today."
const image = "/images/logo-black.png";
const website = "https://kiacademy.in"

export const metadataObj: Metadata = {
    title: title,
    description: description,
    generator: "Next.js",
    applicationName: "KI Academy",
    referrer: "origin-when-cross-origin",
    keywords: [
        "Learning Management System",
        "LMS software",
        "Online learning platform",
        "E-learning system",
        "Corporate training software",
        "Course management system",
        "Virtual classroom platform",
        "Online education tools",
        "Training management system",
        "LMS for schools",
        "Remote learning software",
        "Employee training platform",
        "Education management system",
        "Distance learning software",
        "Online training platform",
        "Learning platform for businesses",
        "Digital learning solutions",
        "Cloud-based LMS",
        "Mobile learning system",
        "Online course platform"
    ],
    authors: [
        { name: "KI Academy", url: website },
        { name: "Abdul Ahad", url: "github.com/ahadsts9901" },
        { name: "Ahmed Raza ", url: "github.com/ahmedraza13" },
    ],
    category: "Software",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: { url: "/images/logo-black.png", type: "image/png" },
        shortcut: { url: "/images/logo-black.png", type: "image/png" },
        apple: "/images/logo-black.png",
    },
    openGraph: {
        title: title,
        description: description,
        type: "website",
        siteName: "Next.js",
        images: [
            {
                url: image,
                width: 800,
                height: 600,
            },
            {
                url: image,
                width: 1800,
                height: 1600,
                alt: "KI Academy",
            },
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: [image],
    },
    appleWebApp: {
        title,
        statusBarStyle: "black-translucent",
        startupImage: [
            image,
            {
                url: image,
                media: "(device-width: 768px) and (device-height: 1024px)",
            },
        ],
    },
};