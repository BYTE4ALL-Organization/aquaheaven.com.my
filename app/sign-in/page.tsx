import { Suspense } from "react";
import type { Metadata } from "next";
import { SignIn } from "@stackframe/stack";
import StoreRedirectAfterLogin from "@/components/auth/StoreRedirectAfterLogin";
import { noIndexMetadata } from "@/lib/seo";

export default function Page() {
  return (
    <div>
      <Suspense fallback={null}>
        <StoreRedirectAfterLogin />
      </Suspense>
      <SignIn
        fullPage={true}
        automaticRedirect={true}
        firstTab="magic-link"
        extraInfo={
          <>
            When signing in, you agree to our <a href="/terms-of-service">Terms</a>
          </>
        }
      />
    </div>
  );
}
