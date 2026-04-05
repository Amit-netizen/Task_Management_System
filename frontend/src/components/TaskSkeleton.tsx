export default function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-3">
            <div className="skeleton w-5 h-5 rounded-full mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + (i * 13) % 30}%` }} />
              <div className="skeleton h-3 rounded" style={{ width: `${40 + (i * 7) % 25}%` }} />
              <div className="flex gap-2 mt-3">
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
