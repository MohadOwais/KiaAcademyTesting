"use client";

import Link from "next/link";
import React from "react";
import { email } from "@/app/utils/data";

const Body = () => {
  return (
    <main className=" container-fluid pt-5 pb-5 lg:p-12 md:p-12 p-8">
      <section className="container text-start text-gray-600">
        <h2 className="gradient mb-6 text-3xl text-center display-4 font-extrabold tracking-tight md:text-4xl">
          Terms and Conditions
        </h2>
        <p className="text-center">Last Updated: December 2024</p>
        <p className="my-6 container text-center col-sm-8">
          Welcome to KI Academy. By accessing or using our Learning Management
          System (LMS), you agree to the following terms and conditions. Please
          read them carefully before using our services.
        </p>
        <ol className="space-y-4 container mt-5 col-sm-8 ">
          <li>
            <strong>Acceptance of Terms</strong>
            <p className="mt-4">
              By using our LMS, you agree to be bound by these Terms and
              Conditions, our Privacy Policy, and any additional terms
              applicable to specific features or services.
            </p>
          </li>
          <li>
            <strong>User Responsibilities</strong>
            <ol className="mt-4 space-y-4 mb-3">
              <li>
                Users must provide accurate and complete information during
                registration and maintain the confidentiality of their account
                credentials.
              </li>
              <li>
                You are responsible for all activities under your account and
                agree to notify us immediately of any unauthorized use.
              </li>
              <li>
                Users shall not engage in any activity that disrupts or harms
                the LMS, including uploading malicious code or unauthorized data
                access.
              </li>
            </ol>
          </li>
          <li>
            <strong>Content and Intellectual Property</strong>
            <ol className="mt-4 space-y-4 mb-3">
              <li>
                All content provided within the LMS, including course materials,
                text, graphics, logos, and software, is the property of KI
                Academy or its content providers and is protected by
                intellectual property laws.
              </li>
              <li>
                Users may not reproduce, distribute, or create derivative works
                from LMS content without prior written consent.
              </li>
              <li>
                Users retain ownership of content they upload but grant KI
                Academy a license to use, display, and distribute such content
                within the LMS.
              </li>
            </ol>
          </li>
          <li>
            <strong>Prohibited Activities</strong>
            <ol className="mt-4 space-y-4 mb-3 ">
              <li>
                Users are prohibited from using the LMS for illegal activities,
                including harassment, fraud, or infringement of intellectual
                property rights.
              </li>
              <li>
                Attempts to access restricted areas of the LMS or interfere with
                its functionality are strictly prohibited.
              </li>
            </ol>
          </li>
          <li>
            <strong>Termination</strong>
            <p className="mt-4">
              KI Academy reserves the right to suspend or terminate access to
              the LMS for violations of these Terms and Conditions or any other
              misuse of the platform.
            </p>
          </li>
          <li>
            <strong>Disclaimers</strong>
            <p className="mt-4">
              {`The LMS is provided "as is" without warranties of any kind, either express or implied. KI Academy does not guarantee uninterrupted or error-free access to the LMS.`}
            </p>
          </li>
          <li>
            <strong>Limitation of Liability</strong>
            <p className="mt-4">
              KI Academy shall not be liable for any direct, indirect,
              incidental, or consequential damages resulting from the use or
              inability to use the LMS.
            </p>
          </li>
          <li>
            <strong>Changes to Terms</strong>
            <p className="mt-4">
              KI Academy reserves the right to update these Terms and Conditions
              at any time. Users will be notified of significant changes through
              the LMS or via email.
            </p>
          </li>
          <li>
            <strong>Contact Us</strong>
            <p className="mt-4">
              For questions or concerns regarding these Terms and Conditions,
              please contact us at{" "}
              <Link className="text-primary" href={`mailto:${email}`}>
                {email}
              </Link>
              .
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
};

export default Body;
