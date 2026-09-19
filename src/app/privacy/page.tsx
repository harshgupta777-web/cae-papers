import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OurPrep",
  description: "Privacy Policy for OurPrep.in",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>

        <p className="mb-8 text-sm text-gray-500">
          Effective Date: September 20, 2026
        </p>

        <div className="space-y-8 leading-7 text-gray-700">
          <section>
            <p>
              Welcome to <strong>OurPrep.in</strong> ("OurPrep", "we", "us",
              or "our"). OurPrep is an educational platform designed to help
              students discover and access study materials, previous-year
              question papers, notes, important questions, answer PDFs, and
              other academic resources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              1. Information We Collect
            </h2>
            <p>
              Depending on how you use OurPrep, we may collect limited
              information such as information you voluntarily provide through
              contact forms, basic technical information, website usage
              information, search interactions, and information collected
              through analytics and advertising services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              2. How We Use Information
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Operate and maintain OurPrep.</li>
              <li>Improve website performance and functionality.</li>
              <li>Understand how students use the website.</li>
              <li>Respond to enquiries and support requests.</li>
              <li>Detect abuse, spam, or security issues.</li>
              <li>Measure website traffic.</li>
              <li>Display and measure advertisements where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">3. Cookies</h2>
            <p>
              OurPrep may use cookies and similar technologies for website
              functionality, analytics, security, advertising, and advertising
              measurement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              4. Google AdSense
            </h2>
            <p>
              OurPrep may use Google AdSense to display advertisements. Google
              and its partners may use cookies or similar technologies to serve
              and measure advertisements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              5. Third-Party Links
            </h2>
            <p>
              OurPrep may contain links to external websites or services. We
              are not responsible for the privacy practices, security, content,
              or policies of third-party websites.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">6. Data Security</h2>
            <p>
              We take reasonable technical and organizational measures to
              protect information handled through the website. However, no
              internet transmission or storage system can be guaranteed to be
              completely secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">8. Contact</h2>
            <p>
              For privacy-related questions, contact us through the email
              address listed on our Contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}