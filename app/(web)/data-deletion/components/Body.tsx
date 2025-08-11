"use client";

import React from "react";
import Link from "next/link";
import { email } from "@/app/utils/data";

const Body = () => {
  return (
    <main className="container-fluid pt-5 pb-5 lg:p-12 md:p-12 p-8">
      <section className="container text-start text-gray-600">
        <h2 className="gradient mb-6 text-center display-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          User Data Deletion Instructions
        </h2>
        <p className="my-6 text-center container col-sm-10">
          At KI Academy, we respect your privacy and are committed to ensuring
          that you have full control over your personal data. Below are detailed
          instructions on how to delete your data associated with KI Academy.
        </p>

        <ol className="space-y-4 container mt-5 col-sm-8  ">
          <li>
            <strong>Disconnecting Your KI Academy Account from Facebook</strong>
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Step 1: Access Facebook Settings</strong>
                <ol className="list-disc pl-6">
                  <li>
                    Log in to your Facebook account using a web browser or the
                    Facebook mobile app.
                  </li>
                  <li>
                    {`For web: Click on the downward arrow icon (▼) in the top-right corner and select`}{" "}
                    <strong>Settings & Privacy</strong>, then{" "}
                    <strong>Settings</strong>.
                  </li>
                  <li>
                    {`For mobile: Tap the three horizontal lines (☰), scroll down, and select`}{" "}
                    <strong>Settings & Privacy</strong>, then{" "}
                    <strong>Settings</strong>.
                  </li>
                </ol>
              </li>
              <li>
                <strong>Step 2: Manage Apps and Websites</strong>
                <ol className="list-disc pl-6">
                  <li>
                    Navigate to <strong>Apps and Websites</strong> under the{" "}
                    <strong>Security</strong> section.
                  </li>
                  <li>
                    Find the section labeled{" "}
                    <strong>Logged in with Facebook</strong> or{" "}
                    <strong>Active</strong> apps.
                  </li>
                </ol>
              </li>
              <li>
                <strong>Step 3: Disconnect KI Academy</strong>
                <ol className="list-disc pl-6">
                  <li>Locate KI Academy in the list of connected apps.</li>
                  <li>
                    Click on KI Academy (web) or tap on it (mobile) to view the
                    app details.
                  </li>
                  <li>
                    Select the option to <strong>Remove App</strong> or{" "}
                    <strong>Disconnect</strong>. Confirm your choice.
                  </li>
                </ol>
              </li>
            </ol>
          </li>

          <li>
            <strong>Deleting Your Data from Google</strong>
            <ol className="mt-4 space-y-4">
              <li>
                <strong>Step 1: Sign In to Your Google Account</strong>
                <p>
                  Go to your Google account and sign in using your credentials.
                </p>
              </li>
              <li>
                <strong>Step 2: Access Account Settings</strong>
                <p>
                  Click on your profile picture or initial in the top-right
                  corner and select <strong>Manage your Google Account</strong>.
                </p>
              </li>
              <li>
                <strong>Step 3: Navigate to Data & Personalisation</strong>
                <p>
                  In the left-hand menu, click on{" "}
                  <strong>Data & personalisation</strong>.
                </p>
              </li>
              <li>
                <strong>Step 4: Manage and Delete Your Data</strong>
                <ol className="list-disc pl-6">
                  <li>
                    Under the <strong>Activity controls</strong> section, you
                    can toggle off activity tracking and manage specific data
                    categories.
                  </li>
                  <li>
                    To delete specific data (e.g., search history or YouTube
                    history), click on <strong>Manage activity</strong> under
                    the relevant category and select the data to delete.
                  </li>
                  <li>
                    For a complete data wipe, select{" "}
                    <strong>Delete activity by</strong>, choose a time range, or
                    delete all activity.
                  </li>
                </ol>
              </li>
              <li>
                <strong>Step 5: Confirm Deletion</strong>
                <p>
                  Follow the prompts to confirm deletion. Note that deleted data
                  cannot be recovered.
                </p>
              </li>
            </ol>
          </li>

          <li>
            <strong>Additional Information</strong>
            <p className="mt-4">
              KI Academy retains personal information only as long as necessary
              to fulfill the purposes outlined in our{" "}
              <Link className="text-primary" href="/privacy-policy">
                Privacy Policy
              </Link>
              . Once data is no longer required, we securely delete or anonymize
              it.
            </p>
          </li>

          <li>
            <strong>Contact Us</strong>
            <p className="mt-4">
              If you have any questions or need assistance with data deletion,
              please reach out to us at{" "}
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
