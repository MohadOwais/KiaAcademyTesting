"use client";

import Link from "next/link";
import "./Body.css";
import React from "react";
import { email } from "@/app/utils/data";

const Body = () => {
  return (
    <main className="container-fluid pt-5 pb-5 lg:p-12 md:p-12 p-8">
      <section className="container text-start text-gray-600">
        <h2 className="gradient mb-6 text-3xl text-center display-4 font-extrabold tracking-tight md:text-4xl">
          Privacy Policy
        </h2>
        <p className="text-center">Last Updated: December 2024</p>
        <p className="my-6">
          {`
          KI Academy is committed to safeguarding the privacy and security of your personal
          information. This Privacy Policy outlines how we collect, use, share, and protect
          your information when you interact with our Learning Management System (LMS),
          including our website, mobile apps, and other products and services. By accessing
          or using KI Academy's services, you agree to the terms described in this Privacy Policy.
          `}
        </p>
        
      </section>
    </main>
  );
};

export default Body;
