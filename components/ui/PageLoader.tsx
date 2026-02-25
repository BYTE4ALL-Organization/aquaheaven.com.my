"use client";

/**
 * Full-height loading placeholder so the footer stays at the bottom
 * while a route (e.g. shop, account) is loading instead of jumping up then down.
 */
export default function PageLoader() {
  return (
    <div
      className="flex min-h-[70vh] w-full items-center justify-center"
      aria-label="Loading"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#F0F0F0] border-t-brand"
        role="status"
      />
    </div>
  );
}
