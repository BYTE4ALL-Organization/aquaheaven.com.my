"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AccountSettings } from "@stackframe/stack";
import PaymentsSection from "@/components/account/PaymentsSection";

export default function AccountPage() {
  const router = useRouter();
  const user = useUser({ or: "return-null" });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace(`/sign-in?redirect=${encodeURIComponent("/account")}`);
    }
  }, [user, router]);

  // Keep scroll position when switching tabs (prevent page from jumping up)
  useEffect(() => {
    if (!user || !mainRef.current) return;
    const main = mainRef.current;
    const onTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('button, [role="tab"], a')) return;
      if (!main.contains(target)) return;
      const savedY = window.scrollY;
      const restore = () => {
        window.scrollTo(0, savedY);
      };
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(restore);
      });
      setTimeout(restore, 50);
      setTimeout(restore, 150);
    };
    main.addEventListener("click", onTabClick, true);
    return () => main.removeEventListener("click", onTabClick, true);
  }, [user]);

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
    <main ref={mainRef} className="pt-10 pb-20 px-4 xl:px-0 max-w-frame mx-auto w-full">
      <AccountSettings
        fullPage={false}
        extraItems={[
          {
            id: "payments",
            title: "Payments",
            content: <PaymentsSection />,
            iconName: "CreditCard",
          },
        ]}
      />
    </main>
  );
}
