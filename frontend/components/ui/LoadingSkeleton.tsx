'use client';

interface LoadingSkeletonProps {
  rows?: number;
  cols?: number;
  type?: 'table' | 'card' | 'list' | 'text';
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded w-full" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer w-10 h-10 rounded-xl" />
      </div>
      <div className="shimmer h-8 w-32 rounded" />
      <div className="shimmer h-3 w-20 rounded" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
          <div className="shimmer w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-48 rounded" />
            <div className="shimmer h-3 w-32 rounded" />
          </div>
          <div className="shimmer h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2">
      <div className="shimmer h-4 w-full rounded" />
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-4 w-5/6 rounded" />
      <div className="shimmer h-4 w-2/3 rounded" />
    </div>
  );
}

export default function LoadingSkeleton({ rows = 5, cols = 5, type = 'table' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return <ListSkeleton />;
  }

  if (type === 'text') {
    return <TextSkeleton />;
  }

  // Table skeleton
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800/80 border-b border-gray-700/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="shimmer h-3 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
