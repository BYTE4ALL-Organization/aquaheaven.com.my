import Image from "next/image";
import Link from "next/link";
import {
  ContentPageLayout,
  contentSectionStyles as s,
} from "@/components/layout/ContentPageLayout";

export const metadata = {
  title: "About Us | Aquaheaven.com.my",
  description: "Learn more about Aquaheaven.com.my",
};

const aboutImageSrc = "/products/footer/about-us/stacked-zen-stones-sand-background-art-balance-concept.jpg";

export default function AboutUsPage() {
  return (
    <ContentPageLayout title="About Us" centerTitle backLinkBelowTitle compactBottom>
      <div className="space-y-8">
        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-center"
          aria-label="About Aquaheaven"
        >
          <div className="relative w-full aspect-[4/3] min-h-[200px] rounded-lg overflow-hidden bg-black/5">
            <Image
              src={aboutImageSrc}
              alt="Stacked zen stones on sand — balance and quality"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className={s.section}>
            <p className={s.p}>
              We believe in bringing a touch of the French Riviera to your daily
              routine. Our carefully curated collection features premium bath
              essentials and luxury towels that transform ordinary moments into
              extraordinary experiences.
            </p>
            <p className={s.p}>
              Whether you're refreshing after a shower or relaxing at the beach,
              our products deliver the perfect blend of quality, comfort, and
              timeless style.
            </p>
          </div>
        </section>

        <section className={s.section}>
          <p className={s.p}>
            For questions or support, please use the{" "}
            <Link href="/contact-us" className={s.link}>
              Contact
            </Link>{" "}
            or{" "}
            <Link href="/customer-support" className={s.link}>
              Customer Support
            </Link>{" "}
            options in the footer.
          </p>
        </section>
      </div>
    </ContentPageLayout>
  );
}
