"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard, ErrorBox, buttonClass, inputClass, labelClass } from "@/components/AuthCard";

const INDUSTRIES = [
  "Technology and IT", "Marketing and Advertising", "Real Estate", "Construction",
  "Manufacturing", "Automotive", "Healthcare", "Education", "Consulting",
  "Professional Services", "Retail", "Logistics", "Event Management",
  "Home Services", "Recruitment and HR Services", "Freelancer / Independent", "Other",
];
const CURRENCIES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED", "KWD", "QAR", "CAD", "AUD", "INR"];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [otherIndustry, setOtherIndustry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const finalIndustry = industry === "Other" ? otherIndustry.trim() : industry;
    if (industry === "Other" && !finalIndustry) {
      setError("Please type your industry.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("create_business", {
      p_name: name.trim(),
      p_industry: finalIndustry,
      p_currency: currency,
      p_timezone: timezone,
      p_language: language,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Set up your business" subtitle="This takes under a minute. You can change it later.">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBox message={error} />
        <div>
          <label htmlFor="bname" className={labelClass}>Business name</label>
          <input id="bname" required maxLength={120} className={inputClass}
            placeholder="Your company, or your own name if you freelance"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="industry" className={labelClass}>Industry</label>
          <select id="industry" className={inputClass} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </div>
        {industry === "Other" && (
          <div>
            <label htmlFor="other" className={labelClass}>Your industry</label>
            <input id="other" className={inputClass} value={otherIndustry}
              onChange={(e) => setOtherIndustry(e.target.value)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="currency" className={labelClass}>Main currency</label>
            <select id="currency" className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="language" className={labelClass}>Language</label>
            <select id="language" className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="tz" className={labelClass}>Time zone</label>
          <input id="tz" className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Creating…" : "Create my workspace"}
        </button>
      </form>
    </AuthCard>
  );
}
