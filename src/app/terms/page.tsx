import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | OurPrep",
  description: "Terms of Use for OurPrep.in",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Terms of Use</h1>

        <p className="mb-8 text-sm text-gray-500">
          Effective Date: September 20, 2026
        </p>

        <div className="space-y-8 leading-7 text-gray-700">
          <section>
            <p>
              By accessing or using <strong>OurPrep.in</strong>, you agree to
              these Terms of Use. If you do not agree with these terms, please
              do not use the website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              1. About OurPrep
            </h2>
            <p>
              OurPrep is an educational platform intended to help students
              discover and organize academic resources, including previous-year
              question papers, CAE/internal examination papers, notes,
              important questions, answer PDFs, syllabi, practical materials,
              and other educational resources.
            </p>
            <p className="mt-3">
              Unless explicitly stated otherwise, OurPrep is not affiliated
              with, endorsed by, sponsored by, or officially associated with
              any university, college, examination authority, or educational
              institution.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              2. Educational Purpose
            </h2>
            <p>
              Materials available through OurPrep are intended for educational
              and reference purposes. Students should verify important academic
              information with their respective college, university, faculty,
              or official academic sources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              3. Third-Party Materials
            </h2>
            <p>
              Some materials available through OurPrep may originate from or
              relate to third-party institutions, universities, colleges,
              authors, educators, or other rights holders.
            </p>
            <p className="mt-3">
              OurPrep does not claim ownership of third-party copyrighted
              material merely by making it available for educational
              reference.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              4. User Responsibility
            </h2>
            <p>Users agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use OurPrep for unlawful purposes.</li>
              <li>Attempt to disrupt or damage the website.</li>
              <li>Circumvent security or access controls.</li>
              <li>Upload malicious files.</li>
              <li>Abuse website functionality.</li>
              <li>Misrepresent OurPrep as an official institution website.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              5. Accuracy of Information
            </h2>
            <p>
              We make reasonable efforts to organize and present information
              accurately. However, errors, outdated information, incorrect
              answers, missing pages, or inaccurate metadata may occur.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              6. Intellectual Property
            </h2>
            <p>
              OurPrep's original website design, branding, software, original
              text, graphics, and other original content may be protected by
              applicable intellectual-property laws. Third-party materials
              remain subject to the rights of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              7. Copyright Complaints
            </h2>
            <p>
              If you believe material available on OurPrep infringes your
              copyright or other intellectual-property rights, please contact
              us using our Copyright & Takedown Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              8. Website Availability
            </h2>
            <p>
              We may modify, suspend, or discontinue parts of the website
              without prior notice. We do not guarantee uninterrupted
              availability of every page, file, feature, or service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              9. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Updated Terms will
              be published on this page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}