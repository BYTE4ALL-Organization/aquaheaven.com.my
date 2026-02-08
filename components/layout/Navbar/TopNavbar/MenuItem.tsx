import Link from "next/link";
import {
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  label: string;
  url?: string;
};

export function MenuItem({ label, url }: MenuItemProps) {
  return (
    <NavigationMenuItem>
      <Link
        href={url ?? "/"}
        className={cn([navigationMenuTriggerStyle(), "font-normal px-3 text-[#1a1a1a] hover:text-brand"])}
      >
        {label}
      </Link>
    </NavigationMenuItem>
  );
}
