import Link from "next/link";

export const metadata = {
  title: "About Us | Shop.co",
  description: "Learn more about Shop.co",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen max-w-frame mx-auto px-4 xl:px-0 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-black/60 hover:text-black mb-4 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">About Us</h1>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-black/80">
        <p className="text-lg">
          We have clothes that suit your style and which you're proud to wear.
          From women to men, we offer a curated selection of quality products.
        </p>
        <p>
          This store is built as a template for developers and businesses to
          customize and deploy. Add your own brand, products, and content to
          make it yours.
        </p>
        <p>
          For questions or support, please use the contact or customer support
          options in the footer.
        </p>
      </div>
    </main>
  );
}
