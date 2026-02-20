"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@stackframe/stack";

/**
 * User icon in navbar: links to /account (profile) when logged in,
 * /sign-in when logged out. Prevents redirect to homepage when clicking profile.
 */
export default function UserProfileLink() {
  const user = useUser({ or: "return-null" });
  const href = user ? "/account" : "/sign-in";

  return (
    <Link href={href} className="p-1" aria-label={user ? "Account / profile" : "Sign in"}>
      <Image
        priority
        src="/icons/user.svg"
        height={100}
        width={100}
        alt="user"
        className="max-w-[22px] max-h-[22px]"
      />
    </Link>
  );
}
