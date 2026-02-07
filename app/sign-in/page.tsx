import { SignIn } from '@stackframe/stack';

export default function Page() {
  return (
    <div>
      <SignIn
        fullPage={true}
        automaticRedirect={true}
        firstTab="magic-link" // or "magic-link"
        extraInfo={
          <>
            When signing in, you agree to our <a href="/terms">Terms</a>
          </>
        }
      />
    </div>
  );
}
