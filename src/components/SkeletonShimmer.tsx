import React from 'react';

interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`skeleton-shimmer rounded-md ${className}`}
  />
);

export const ProductCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="bg-white rounded-xl overflow-hidden border border-stone-200 flex flex-col"
  >
    {/* 1:1 Image Placeholder */}
    <div className="relative aspect-square w-full border-b border-stone-100 skeleton-shimmer" />

    {/* Content Body */}
    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <SkeletonBlock className="h-4 w-3/4 rounded-md" />
        <SkeletonBlock className="h-3 w-full rounded" />
        <SkeletonBlock className="h-3 w-5/6 rounded" />
      </div>

      <div className="space-y-1.5">
        <SkeletonBlock className="h-2.5 w-16 rounded" />
        <SkeletonBlock className="h-5 w-1/2 rounded-md" />
      </div>

      <div className="pt-1 grid grid-cols-2 gap-2">
        <SkeletonBlock className="h-10 w-full rounded-lg" />
        <SkeletonBlock className="h-10 w-full rounded-lg" />
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <SkeletonBlock className="h-3 w-14 rounded" />
        <div className="flex items-center gap-1.5">
          <SkeletonBlock className="h-7 w-20 rounded-md" />
          <SkeletonBlock className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

export const ProductCatalogSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div
    role="status"
    aria-label="Menyiapkan daftar produk"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <ProductCardSkeleton key={idx} />
    ))}
  </div>
);

export const PortalErpSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Menyiapkan portal"
    className="min-h-screen bg-[#F7F8F6] flex"
  >
    {/* Sidebar Skeleton */}
    <aside className="hidden lg:flex w-64 bg-white border-r border-stone-200 flex-col p-5 space-y-6 shrink-0">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
        <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonBlock className="h-3.5 w-28" />
          <SkeletonBlock className="h-2.5 w-20" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 7 }).map((_, idx) => (
          <SkeletonBlock key={idx} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </aside>

    {/* Main Content Skeleton */}
    <div className="flex-1 flex flex-col min-w-0">
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between">
        <SkeletonBlock className="h-5 w-48" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-7 w-32" />
              <SkeletonBlock className="h-2.5 w-20" />
            </div>
          ))}
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="h-8 w-32 rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);

export const ModalSkeletonFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Menyiapkan jendela"
    className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-3 sm:p-5"
  >
    <div className="bg-white rounded-2xl border border-stone-300 max-w-2xl w-full overflow-hidden">
      <div className="px-6 py-4 bg-[#0F5132] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15" />
          <div className="space-y-1.5">
            <div className="h-4 w-44 rounded bg-white/25" />
            <div className="h-3 w-28 rounded bg-white/15" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-lg bg-white/15" />
      </div>

      <div className="p-6 space-y-5 bg-[#FAFBF9]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
        <SkeletonBlock className="h-24 w-full rounded-xl" />
        <div className="space-y-2.5">
          <SkeletonBlock className="h-16 w-full rounded-xl" />
          <SkeletonBlock className="h-16 w-full rounded-xl" />
        </div>
        <SkeletonBlock className="h-12 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export const ChatTypingSkeleton: React.FC = () => (
  <div className="flex items-start" role="status" aria-label="Menyiapkan balasan">
    <div className="bg-white rounded-xl px-4 py-3 border border-stone-200 w-56 space-y-2">
      <SkeletonBlock className="h-2.5 w-full rounded-full" />
      <SkeletonBlock className="h-2.5 w-4/5 rounded-full" />
      <SkeletonBlock className="h-2.5 w-3/5 rounded-full" />
    </div>
  </div>
);
