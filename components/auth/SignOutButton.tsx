"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      className={`material-symbols-outlined text-primary p-2 rounded-full hover:bg-surface-container-low transition-all active:scale-95 ${className}`}
      aria-label="تسجيل الخروج"
    >
      logout
    </button>
  );
}
