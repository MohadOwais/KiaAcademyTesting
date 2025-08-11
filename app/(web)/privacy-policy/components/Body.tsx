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
        <ol className="space-y-6 container">
          <li>
            Information We Collect
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Personal Information:</strong> When you sign up or use
                our LMS, we may collect personal details such as your name,
                email address, phone number, organization, and role (e.g.,
                student, teacher, administrator).
              </li>
              <li>
                <strong>Usage Information:</strong> We may gather details about
                how you interact with our LMS, such as pages visited, features
                used, and system performance.
              </li>
              <li>
                <strong>Course Data:</strong> We collect information related to
                the courses you enroll in, progress tracking, submitted
                assignments, and certifications earned.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the
                device you use to access the LMS, including device type,
                browser, operating system, and IP address, may be collected.
              </li>
              <li>
                <strong>Cookies and Tracking:</strong> We use cookies and other
                tracking technologies to enhance your experience and analyze
                usage patterns.
              </li>
            </ol>
          </li>
          <li>
            How We Use Your Information
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Service Delivery:</strong> To provide, maintain, and
                improve the LMS functionality, including course management,
                learning analytics, and personalization.
              </li>
              <li>
                <strong>Communication:</strong> To send updates, announcements,
                newsletters, and respond to inquiries.
              </li>
              <li>
                <strong>Performance Monitoring:</strong> To analyze system
                performance and ensure the LMS operates smoothly.
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with legal
                obligations and enforce our terms of service.
              </li>
            </ol>
          </li>
          <li>
            Sharing Your Information
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Service Providers:</strong> We may share information
                with trusted third-party providers who assist in delivering our
                LMS services. These providers are obligated to maintain
                confidentiality.
              </li>
              <li>
                <strong>Institutional Partners:</strong> If your access to KI
                Academy is provided through an institution, we may share
                relevant data with that institution.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information
                to comply with applicable laws or respond to legal processes.
              </li>
              <li>
                <strong>Business Transactions:</strong> In the event of a
                merger, acquisition, or sale, your information may be
                transferred to the acquiring entity.
              </li>
            </ol>
          </li>
          <li>
            Security
            <div className="ol-to-div mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                We implement robust security measures to protect your data.
                However, no system is completely secure, and we cannot guarantee
                absolute security.
              </li>
            </div>
          </li>
          <li>
            Your Choices
            <div className="mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                You can access, update, or delete your personal information by
                contacting us. You may also opt out of receiving marketing
                communications by following the provided instructions or
                reaching out to us at{" "}
                <Link className="text-primary" href={`mailto:${email}`}>
                  {email}
                </Link>
                .
              </li>
            </div>
          </li>
          <li>
            Changes to this Privacy Policy
            <div className="mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                KI Academy reserves the right to update this Privacy Policy as
                needed to reflect changes in our practices, technology, or legal
                requirements. We will notify users of significant updates
                through the LMS or email.
              </li>
            </div>
          </li>
          <li>
            Contact Us
            <div className="mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                For questions, concerns, or requests regarding this Privacy
                Policy, please contact us at{" "}
                <Link className="text-primary" href={`mailto:${email}`}>
                  {email}
                </Link>
                .
              </li>
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
};

export default Body;
