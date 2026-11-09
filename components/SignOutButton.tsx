"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
