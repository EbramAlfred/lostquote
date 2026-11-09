export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="mt-6 h-11 rounded-lg bg-slate-200" />
      <div className="mt-6 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
