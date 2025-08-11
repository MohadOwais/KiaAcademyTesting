"use client";

import Link from "next/link";
import "./Body.css";
import React from "react";
import { email } from "@/app/utils/data";

const Body = () => {
  return (
    <main className=" container-fluid pt-5 pb-5 lg:p-12 md:p-12 p-8">
      <section className="container text-start text-gray-600">
        <h2 className="gradient mb-6 text-3xl text-center display-4 font-extrabold tracking-tight md:text-4xl">
          Refund Policy
        </h2>
        <p className="text-center">Last Updated: December 2024</p>
        <p className="my-6">
          {`
          At KI Academy, we strive to provide high-quality educational content to our users.
          This Refund Policy outlines the conditions under which you may request a refund for
          courses purchased on our platform. By purchasing a course from KI Academy, you
          agree to the terms described in this policy.
          `}
        </p>
        <ol className="space-y-6 container">
          <li>
            Eligibility for Refunds
            <ol className="mt-4 space-y-4">
              <li>
                <strong>7-Day Refund Window:</strong> Refund requests must be
                submitted within 7 days of purchasing the course. After this
                period, no refunds will be issued.
              </li>
              <li>
                <strong>Course Progress:</strong> Refunds will not be granted if
                you have accessed more than 20% of the course content.
              </li>
              <li>
                <strong>Promotional Offers:</strong> Courses purchased during
                promotional periods or at discounted rates may not be eligible
                for refunds unless explicitly stated.
              </li>
            </ol>
          </li>
          <li>
            How to Request a Refund
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Contact Support:</strong> To initiate a refund, please
                contact our support team at{" "}
                <Link className="text-primary" href={`mailto:${email}`}>
                  {email}
                </Link>
                . Include your order details and the reason for the refund.
              </li>
              <li>
                <strong>Verification:</strong> Our team will verify your request
                to ensure it meets the refund eligibility criteria.
              </li>
              <li>
                <strong>Processing Time:</strong> Approved refunds will be
                processed within 7-10 business days. Refunds will be issued to
                the original payment method used at the time of purchase.
              </li>
            </ol>
          </li>
          <li>
            Non-Refundable Cases
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Course Completion:</strong> Refunds will not be issued
                if you have completed the course or received a certification.
              </li>
              <li>
                <strong>Violation of Terms:</strong>
                {`Refunds will not be provided in cases where the user has violated KI Academy's terms of service.`}
              </li>
              <li>
                <strong>Technical Issues:</strong>
                {`Refunds will not be granted for technical issues arising from the user's device or internet connectivity.`}
              </li>
            </ol>
          </li>
          <li>
            Changes to this Refund Policy
            <div className="mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                KI Academy reserves the right to update this Refund Policy to
                reflect changes in our practices, technology, or legal
                requirements. Users will be notified of significant updates via
                email or through our platform.
              </li>
            </div>
          </li>
          <li>
            Contact Us
            <div className="mt-4 space-y-4 pl-4 md:pl-8">
              <li>
                For questions, concerns, or refund requests, please reach out to
                us at{" "}
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
