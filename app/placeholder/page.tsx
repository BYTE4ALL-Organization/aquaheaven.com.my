import Link from "next/link";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata("Placeholder"),
  description: "Placeholder page that is intentionally excluded from indexing.",
};

export default function PlaceholderPage() {
  return (
    <main className="min-h-screen max-w-frame mx-auto px-4 xl:px-0 py-16 flex flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-2">Placeholder Page</h1>
        <p className="text-black/60 mb-6">
          This is a placeholder. Add your own content here when you're ready.
          Use this template as a starting point and replace placeholder pages
          with your real content.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-black underline hover:no-underline"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
