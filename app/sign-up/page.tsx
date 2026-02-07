import { SignIn, SignUp } from '@stackframe/stack';

export default function Page() {
  return (
    <div>
      <SignUp
        fullPage={true}
        automaticRedirect={true}
        firstTab="magic-link" // or "magic-link"
        extraInfo={
          <>
            When signing up, you agree to our <a href="/terms">Terms</a>
          </>
        }
      />
    </div>
  );
}
