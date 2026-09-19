import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright & Takedown Policy | OurPrep",
  description: "Copyright and Takedown Policy for OurPrep.in",
};

export default function CopyrightPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">
          Copyright & Takedown Policy
        </h1>

        <p className="mb-8 text-sm text-gray-500">
          Effective Date: September 20, 2026
        </p>

        <div className="space-y-8 leading-7 text-gray-700">
          <section>
            <p>
              OurPrep respects the intellectual-property rights of universities,
              colleges, authors, educators, students, publishers, and other
              content creators.
            </p>

            <p className="mt-3">
              Some academic materials available on OurPrep may originate from
              third parties. OurPrep does not claim ownership of third-party
              materials unless ownership is explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              1. Who Can Submit a Request?
            </h2>
            <p>
              A copyright complaint may be submitted by the copyright owner or
              an authorized representative of the copyright owner.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              2. Information to Include
            </h2>

            <p>To help us review a complaint, please provide:</p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Identification of the copyrighted work.</li>
              <li>
                The URL or sufficient information to locate the material on
                OurPrep.
              </li>
              <li>Your full name and email address.</li>
              <li>Your relationship to the copyrighted work.</li>
              <li>An explanation of the alleged infringement.</li>
              <li>
                A statement confirming that the information provided is
                accurate to the best of your knowledge.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              3. How to Submit a Request
            </h2>

            <p>
              Send the complaint through the contact details available on our
              Contact page with the subject:
            </p>

            <p className="mt-3 font-semibold">
              Copyright Takedown Request – OurPrep
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              4. Review Process
            </h2>

            <p>After receiving a complaint, OurPrep may:</p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Review the submitted information.</li>
              <li>Request additional information.</li>
              <li>Temporarily restrict access to the identified material.</li>
              <li>Remove the material where appropriate.</li>
              <li>
                Contact the relevant uploader or contributor where applicable.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              5. Good-Faith Complaints
            </h2>

            <p>
              Please do not submit knowingly false or misleading copyright
              complaints. We may request evidence or additional information
              when necessary to evaluate a complaint.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              6. Third-Party Content
            </h2>

            <p>
              OurPrep may contain materials that belong to universities,
              colleges, educators, authors, publishers, or other third parties.
              The presence of such material on OurPrep does not mean that
              OurPrep claims ownership of it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">7. Contact</h2>

            <p>
              For copyright and takedown requests, please use the contact
              information available on our Contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}