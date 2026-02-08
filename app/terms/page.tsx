import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Aquaheaven.com.my",
  description: "Terms and conditions of use for Aquaheaven.com.my",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen max-w-frame mx-auto px-4 xl:px-0 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-[#1a1a1a]/60 hover:text-brand mb-4 inline-block transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-[#1a1a1a]">Terms & Conditions</h1>
        <p className="text-[#1a1a1a]/60 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-[#1a1a1a]/80">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by these
            Terms and Conditions. If you do not agree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">2. Use of the Service</h2>
          <p>
            You may use this site for lawful purposes only. You are responsible for
            maintaining the confidentiality of your account and for all activity under
            your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">3. Products and Orders</h2>
          <p>
            We reserve the right to limit quantities, correct errors, and modify or
            discontinue products. We do not guarantee that all products will be
            available at all times.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">4. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, we shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your
            use of this site or any products purchased through it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">5. Contact</h2>
          <p>
            For questions about these Terms & Conditions, please contact us through
            the contact information provided on this website.
          </p>
        </section>
      </div>
    </main>
  );
}
