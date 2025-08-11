import React from 'react';
import Main from './Main';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

interface PageProps {
  params: Promise<{ courseId: string }>;
}
async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;
  return <Main courseId={courseId} />;
}

export default Page;
