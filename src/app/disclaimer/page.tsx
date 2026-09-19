import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | OurPrep",
  description: "Disclaimer for OurPrep.in",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">OurPrep Disclaimer</h1>

        <p className="mb-8 text-sm text-gray-500">
          Effective Date: September 20, 2026
        </p>

        <div className="space-y-8 leading-7 text-gray-700">
          <section>
            <p>
              OurPrep.in is an independent educational-resource platform
              created to help students find and organize academic study
              resources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              1. No Official Affiliation
            </h2>
            <p>
              Unless explicitly stated otherwise, OurPrep is not affiliated
              with, endorsed by, sponsored by, or officially associated with
              any university, college, examination authority, or educational
              institution whose name or academic materials may appear on the
              website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              2. Previous-Year Papers
            </h2>
            <p>
              OurPrep may provide access to previous-year question papers,
              internal examination papers, CAE papers, class tests, and other
              examination-related materials for educational and reference
              purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              3. No Examination Guarantee
            </h2>
            <p>
              Previous-year papers and important questions should not be
              interpreted as predictions or guarantees of future examination
              questions. Examination patterns, syllabi, marks, subjects, and
              question formats may change.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              4. Third-Party Rights
            </h2>
            <p>
              Some materials may contain content created or supplied by third
              parties. OurPrep does not claim ownership of third-party
              copyrighted material unless expressly stated.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              5. Accuracy
            </h2>
            <p>
              We attempt to organize academic material accurately, but mistakes
              may occur. OurPrep does not guarantee that every question paper,
              answer, solution, note, subject classification, examination
              classification, academic year, course, or branch classification
              is completely accurate or current.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              6. External Websites
            </h2>
            <p>
              OurPrep may link to external websites. We do not control and are
              not responsible for external websites, their content,
              availability, privacy practices, or policies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">
              7. Copyright Concerns
            </h2>
            <p>
              If you believe that material hosted or referenced on OurPrep
              infringes your copyright, please contact us through our Copyright
              & Takedown Policy.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}