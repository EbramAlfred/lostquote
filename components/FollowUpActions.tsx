"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { btnGhost, btnPrimary, field } from "@/components/ui";
import { labelClass } from "@/components/AuthCard";

export type TaskLite = {
  id: string;
  due_date: string;
  state: "pending" | "completed" | "skipped";
  business_id: string;
};

const CHANNELS = [
  { v: "whatsapp", l: "WhatsApp" },
  { v: "email", l: "Email" },
  { v: "phone", l: "Phone call" },
  { v: "sms", l: "SMS" },
  { v: "linkedin", l: "LinkedIn" },
  { v: "other", l: "Other" },
];

export function FollowUpActions({ task, userId, canEdit }: { task: TaskLite; userId: string; canEdit: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "done" | "move">(null);
  const [channel, setChannel] = useState("whatsapp");
  const [response, setResponse] = useState("");
  const [outcome, setOutcome] = useState("");
  const [date, setDate] = useState(task.due_date);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canEdit || task.state !== "pending") return null;

  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, action: string) {
    setBusy(true);
    setError(null);
    const { error } = await fn();
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    await createClient().from("activity_logs").insert({
      business_id: task.business_id,
      actor_id: userId,
      entity_type: "follow_up",
      entity_id: task.id,
      action,
    });
    setBusy(false);
    setMode(null);
    router.refresh();
  }

  const supabase = createClient();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btnPrimary + " !py-1.5"} onClick={() => setMode("done")}>Mark done</button>
      <button className={btnGhost + " !py-1.5"} onClick={() => setMode("move")}>Reschedule</button>
      <button
        className="rounded-lg px-3 py-1.5 text-sm text-muted transition hover:bg-slate-100"
        disabled={busy}
        onClick={() =>
          run(
            () => supabase.from("follow_up_tasks").update({ state: "skipped" }).eq("id", task.id),
            "skipped"
          )
        }
      >
        Skip
      </button>

      {mode && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {mode === "done" ? (
              <>
                <h2 className="text-lg font-semibold text-navy">Record this follow-up</h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="ch">How did you follow up?</label>
                    <select id="ch" className={field} value={channel} onChange={(e) => setChannel(e.target.value)}>
                      {CHANNELS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="resp">What did the customer say?</label>
                    <textarea id="resp" rows={2} className={field} value={response} onChange={(e) => setResponse(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="out">Result and next step</label>
                    <textarea id="out" rows={2} className={field} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-navy">Reschedule follow-up</h2>
                <div className="mt-4">
                  <label className={labelClass} htmlFor="nd">New date</label>
                  <input id="nd" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button className={btnGhost} onClick={() => setMode(null)}>Cancel</button>
              {mode === "done" ? (
                <button
                  className={btnPrimary}
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        supabase.from("follow_up_tasks").update({
                          state: "completed",
                          channel,
                          customer_response: response.trim() || null,
                          outcome: outcome.trim() || null,
                          completed_at: new Date().toISOString(),
                          completed_by: userId,
                        }).eq("id", task.id),
                      "completed"
                    )
                  }
                >
                  {busy ? "Saving…" : "Save follow-up"}
                </button>
              ) : (
                <button
                  className={btnPrimary}
                  disabled={busy || !date}
                  onClick={() =>
                    run(async () => {
                      const { data, error: e1 } = await supabase
                        .from("follow_up_tasks").select("rescheduled_count").eq("id", task.id).single();
                      if (e1) return { error: e1 };
                      return supabase.from("follow_up_tasks").update({
                        due_date: date,
                        rescheduled_count: (data?.rescheduled_count ?? 0) + 1,
                      }).eq("id", task.id);
                    }, "rescheduled")
                  }
                >
                  {busy ? "Saving…" : "Save new date"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {error && !mode && <p role="alert" className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}
