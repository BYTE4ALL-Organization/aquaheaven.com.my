import { Suspense } from "react";
import { SignIn } from "@stackframe/stack";
import StoreRedirectAfterLogin from "@/components/auth/StoreRedirectAfterLogin";

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
            When signing in, you agree to our <a href="/terms">Terms</a>
          </>
        }
      />
    </div>
  );
}
