"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard, ErrorBox, SuccessBox, buttonClass, inputClass, labelClass,
} from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  // The email link lands back here with ?error=link_expired when it was already used or is too old.
  const expired = useSearchParams().get("error") === "link_expired";
  const [email, setEmail] = useState("");
  const [submitError, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const error = submitError ?? (expired ? "That reset link has expired or was already used. Enter your email to get a new one." : null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(
        error.status === 429 || error.code === "over_email_send_rate_limit"
          ? "An email was just sent. Wait about a minute before asking for another one, and check your inbox and spam folder."
          : error.message
      );
      return;
    }
    setNotice("If an account exists for that email, a reset link is on its way. It can take a minute. Check your spam folder, and open the link only once.");
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBox message={error} />
        <SuccessBox message={notice} />
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" required autoComplete="email" className={inputClass}
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
