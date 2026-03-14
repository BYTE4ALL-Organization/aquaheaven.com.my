import { StackHandler } from "@stackframe/stack";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Auth Handler");

export default function Handler() {
  return <StackHandler fullPage />;
}
