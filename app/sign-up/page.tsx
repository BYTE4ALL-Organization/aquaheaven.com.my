import type { Metadata } from "next";
import { SignUp } from "@stackframe/stack";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Sign Up");

export default function Page() {
  return (
    <div>
      <SignUp
        fullPage={true}
        automaticRedirect={true}
        firstTab="magic-link" // or "magic-link"
        extraInfo={
          <>
            When signing up, you agree to our <a href="/terms-of-service">Terms</a>
          </>
        }
      />
    </div>
  );
}
