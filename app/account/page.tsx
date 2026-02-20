"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountSettings } from "@stackframe/stack";
import PaymentsSection from "@/components/account/PaymentsSection";

export default function AccountPage() {
  const router = useRouter();
  const user = useUser({ or: "return-null" });

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace(`/sign-in?redirect=${encodeURIComponent("/account")}`);
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent" />
      </main>
    );
  }

  if (user === null) {
    return null;
  }

  return (
    <AccountSettings
      fullPage={true}
      extraItems={[
        {
          id: "payments",
          title: "Payments",
          content: <PaymentsSection />,
          iconName: "CreditCard",
        },
      ]}
    />
  );
}
