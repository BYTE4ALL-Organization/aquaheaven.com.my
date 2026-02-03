import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Shop.co",
  description: "Privacy policy for Shop.co",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen max-w-frame mx-auto px-4 xl:px-0 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-black/60 hover:text-black mb-4 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-black/60 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-black/80">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>
            We may collect information you provide directly (name, email, address,
            payment details when you make a purchase) and information collected
            automatically (device information, cookies, usage data).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p>
            We use your information to process orders, communicate with you, improve
            our services, and comply with legal obligations. We do not sell your
            personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect
            your personal data against unauthorized access, alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct,
            delete, or port your personal data, or to object to or restrict certain
            processing. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
          <p>
            For privacy-related questions or requests, please contact us through
            the contact information provided on this website.
          </p>
        </section>
      </div>
    </main>
  );
}
