import React from 'react';
import Main from './Main';

export const metadata = {
    title: 'Courses | Learn Academy',
    description: 'Browse our wide selection of courses',
};

// Define PageProps in line with Next.js expectations
type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
};

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  // Since searchParams might be a Promise, we await it
  const resolvedSearchParams = await searchParams;
  
  return (
    <Main searchParams={resolvedSearchParams} />
  );
};

export default Page;