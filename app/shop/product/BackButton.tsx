 "use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/shop");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <span aria-hidden="true">←</span>
      <span>Back To Products</span>
    </button>
  );
}

