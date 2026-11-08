export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-navy">Welcome to LostQuote</h1>
      <p className="mt-2 text-muted">
        Your workspace is ready. Customers, quotations and follow-ups are coming in the next phases.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-navy">Coming next</h2>
        <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm text-muted">
          <li>Customers</li>
          <li>Quotations</li>
          <li>Follow-ups</li>
          <li>Dashboard numbers and charts</li>
        </ol>
      </div>
    </div>
  );
}
