import Link from "next/link";

export const metadata = {
  title: "About Us | Aquaheaven.com.my",
  description: "Learn more about Aquaheaven.com.my",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen max-w-frame mx-auto px-4 xl:px-0 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-[#1a1a1a]/60 hover:text-brand mb-4 inline-block transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-[#1a1a1a]">About Us</h1>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-[#1a1a1a]/80">
        <p className="text-lg">
        Quality essentials for your body and home. From luxurious soaps to Saint-Tropez inspired towels.
        </p>
        <p>
          We believe in bringing a touch of the French Riviera to your daily routine. Our carefully curated collection features premium bath essentials and luxury towels that transform ordinary moments into extraordinary experiences.
        </p>
        <p>
          Whether you're refreshing after a shower or relaxing at the beach, our products deliver the perfect blend of quality, comfort, and timeless style.
        </p>
        <p>
          For questions or support, please use the contact or customer support options in the footer.
        </p>
      </div>
    </main>
  );
}
