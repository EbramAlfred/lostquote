"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-lg font-semibold text-navy">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">Please try again. If it keeps happening, reload the page.</p>
      <button onClick={reset}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
        Try again
      </button>
    </div>
  );
}
