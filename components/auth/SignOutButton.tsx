"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={`rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container disabled:opacity-45 ${className}`}
      aria-label="تسجيل الخروج"
    >
      <LogOut className="size-5" aria-hidden="true" />
    </button>
  );
}
