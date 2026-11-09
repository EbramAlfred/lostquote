export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-44 rounded bg-black/10" />
      <div className="mt-5 h-11 rounded-xl bg-black/10" />
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-black/10" />
        ))}
      </div>
    </div>
  );
}
