import Link from "next/link";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

type ContentPageLayoutProps = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  centerTitle?: boolean;
  /** When true, "Back to home" is rendered below the page title instead of above */
  backLinkBelowTitle?: boolean;
  /** When true, reduces bottom spacing so footer/newsletter sits closer */
  compactBottom?: boolean;
};

export function ContentPageLayout({
  title,
  subtitle,
  children,
  className,
  centerTitle = false,
  backLinkBelowTitle = false,
  compactBottom = false,
}: ContentPageLayoutProps) {
  const backLink = (
    <Link
      href="/"
      className="text-sm text-black/60 hover:text-black inline-block transition-colors"
      aria-label="Back to home"
    >
      ← Back to home
    </Link>
  );

  const isTitleLineWithBack = backLinkBelowTitle && centerTitle;

  return (
    <main
      className={cn(
        "max-w-frame mx-auto px-4 xl:px-0 pt-2 md:pt-2",
        compactBottom ? "pb-6" : "pb-0",
        !compactBottom && "min-h-screen",
        className
      )}
    >
      {!backLinkBelowTitle && backLink}
      {!backLinkBelowTitle && <div className="mb-6" />}
      <header
        className={cn(
          backLinkBelowTitle ? (isTitleLineWithBack ? "mb-4" : "mb-2") : "mb-10",
          centerTitle && !isTitleLineWithBack && "text-center max-w-2xl mx-auto"
        )}
      >
        {isTitleLineWithBack ? (
          <div className="flex items-center justify-between gap-4">
            {backLink}
            <h1
              className={cn(
                integralCF.className,
                "flex-1 text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent text-center"
              )}
            >
              {title}
            </h1>
            <span className="w-[72px] shrink-0" aria-hidden />
          </div>
        ) : (
          <h1
            className={cn(
              integralCF.className,
              "text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent"
            )}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <div className="mt-2 text-black/60 text-sm">{subtitle}</div>
        )}
      </header>
      {backLinkBelowTitle && !isTitleLineWithBack && backLink}
      <div className="content-page-body text-black/60 text-sm md:text-base leading-relaxed">
        {children}
      </div>
    </main>
  );
}

export const contentSectionStyles = {
  section: "space-y-6",
  h2: "text-lg font-medium text-black/90 mb-3",
  h3: "text-base font-medium text-black/85 mb-2",
  p: "text-black/60 text-sm md:text-base leading-relaxed",
  ul: "list-disc pl-6 space-y-2 text-black/60 text-sm md:text-base",
  link: "text-brand hover:underline",
} as const;
