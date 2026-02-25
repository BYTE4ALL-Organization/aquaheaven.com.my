import PageLoader from "@/components/ui/PageLoader";

/**
 * Shown while a route is loading so the footer doesn’t jump up then down.
 * Stack uses React Suspense, which will render this while user data is being fetched.
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function Loading() {
  return <PageLoader />;
}
