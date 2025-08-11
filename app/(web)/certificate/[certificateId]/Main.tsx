'use client';
import React from 'react'
import Header from "../../../components/header/Header"
import Footer from "../../../components/footer/Footer"
import Certificate from '././components/CertificatePage'
import { useParams } from 'next/navigation';

const Main = () => {
  const params = useParams();
  // params.certificateId will be available as a string or array
  const certificateId = Array.isArray(params.certificateId) ? params.certificateId[0] : params.certificateId;
  if (!certificateId) return null; // or show a loading/error state
  return (
    <>
      <Header />
      <Certificate certificateId={certificateId as string} />
      <Footer />
    </>
  );
}

export default Main