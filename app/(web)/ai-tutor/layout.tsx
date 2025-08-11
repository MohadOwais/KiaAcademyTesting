import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor - KI Academy",
  description: "Get instant help with your studies using our AI-powered tutor",
};

export default function AITutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 