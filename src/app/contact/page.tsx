import Link from "next/link";

const contacts = [
  {
    name: "Bhavishay",
    email: "bhavishay.reads@gmail.com",
  },
  {
    name: "Harsh",
    email: "harshgupta5816@gmail.com",
  },
  {
    name: "Chandraprakash",
    email: "cprakashjaiswal41@gmail.com",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
            Get in touch
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Have a question, found an issue, or want to contribute material
            to OurPrep? Feel free to reach out to us.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {contacts.map((contact) => (
            <div
              key={contact.email}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                {contact.name.charAt(0)}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                {contact.name}
              </h2>

              <a
                href={`mailto:${contact.email}`}
                className="mt-3 block break-all text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {contact.email}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Follow OurPrep
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Stay updated with new papers, answers and study material.
          </p>

          <a
            href="https://www.instagram.com/ourprep.in?stkn=M2Vmc3ZkenpvMGF3"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Follow us on Instagram ↗
          </a>
          <a
            href="https://www.linkedin.com/company/ourprep"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Follow us on Linkedin ↗
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            ← Back to OurPrep
          </Link>
        </div>
      </section>
    </main>
  );
}