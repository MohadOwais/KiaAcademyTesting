"use client";

import React from "react";
import Link from "next/link";
import { email } from "@/app/utils/data";

const Body = () => {
  return (
    <main className="container-fluid pt-5 pb-5 lg:p-12 md:p-12 p-8">
      <section className="container text-start text-gray-600">
        <h2 className="gradient text-center  display-4 mb-6 text-3xl font-extrabold tracking-tight md:text-4xl">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="my-6 mt-3 text-center ">
          Welcome to the KI Academy FAQ page. Here, you’ll find answers to
          common questions about our platform, policies, and services.
        </p>
        <ol className="space-y-4 container mt-5 col-sm-8  ">
          <li>
            <strong>What is KI Academy?</strong>
            <p className="mt-4">
              KI Academy is a Learning Management System (LMS) designed to
              provide high-quality educational content, manage courses, and
              facilitate learning experiences for students, teachers, and
              administrators.
            </p>
          </li>
          <li>
            <strong>How do I create an account?</strong>
            <p className="mt-4">
              You can create an account by signing up on our platform and
              providing the required details such as your name, email, and role
              (student, teacher, or admin).
            </p>
          </li>
          <li>
            <strong>
              What are the Terms and Conditions of using KI Academy?
            </strong>
            <p className="mt-4">
              By using KI Academy, you agree to abide by our{" "}
              <Link className="text-primary" href="/terms-and-conditions">
                Terms and Conditions
              </Link>
              , which include guidelines on account usage, intellectual property
              rights, and prohibited activities.
            </p>
          </li>
          <li>
            <strong>What is KI Academy’s Privacy Policy?</strong>
            <p className="mt-4">
              Our{" "}
              <Link className="text-primary" href="/privacy-policy">
                Privacy Policy
              </Link>{" "}
              outlines how we collect, use, and protect your personal
              information while ensuring your privacy and security.
            </p>
          </li>
          <li>
            <strong>Can I get a refund for a course?</strong>
            <p className="mt-4">
              Refunds are available under specific conditions, such as
              submitting a request within 7 days of purchase and not accessing
              more than 20% of the course content. Refer to our{" "}
              <Link className="text-primary" href="/refund-policy">
                Refund Policy
              </Link>{" "}
              for more details.
            </p>
          </li>
          <li>
            <strong>How do I request a refund?</strong>
            <p className="mt-4">
              To request a refund, contact our support team at{" "}
              <Link className="text-primary" href={`mailto:${email}`}>
                {email}
              </Link>{" "}
              with your order details and reason for the refund.
            </p>
          </li>
          <li>
            <strong>What happens if I encounter technical issues?</strong>
            <p className="mt-4">
              For technical support, please reach out to us at{" "}
              <Link className="text-primary" href={`mailto:${email}`}>
                {email}
              </Link>
              . Note that refunds are not provided for issues caused by user
              devices or internet connectivity.
            </p>
          </li>
          <li>
            <strong>What security measures are in place?</strong>
            <p className="mt-4">
              We use robust security protocols to protect your data. However,
              while we strive for maximum security, we cannot guarantee complete
              protection against all risks.
            </p>
          </li>
          <li>
            <strong>Can I delete my account or update my information?</strong>
            <p className="mt-4">
              Yes, you can request account deletion or data updates by
              contacting us at{" "}
              <Link className="text-primary" href={`mailto:${email}`}>
                {email}
              </Link>
              .
            </p>
          </li>
          <li>
            <strong>How can I contact KI Academy?</strong>
            <p className="mt-4 pb-20">
              For any inquiries, feedback, or support, please email us at{" "}
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
