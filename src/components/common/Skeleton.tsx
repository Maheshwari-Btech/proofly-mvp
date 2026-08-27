import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-7 w-16 mb-1.5" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

export const OpportunityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-[320px]">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1.5 flex-1 pr-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-1/3 mb-4" />
        <Skeleton className="h-14 w-full rounded-xl mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
};

export const EvidenceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-[280px]">
      <div>
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5 mb-2" />
        <Skeleton className="h-3.5 w-2/5 mb-3" />
        <Skeleton className="h-10 w-full mb-4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OpportunityCardSkeleton />
              <OpportunityCardSkeleton />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EvidenceCardSkeleton />
              <EvidenceCardSkeleton />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReadinessSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Hero Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <Skeleton className="h-32 w-32 rounded-full mb-3" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Gap Spotlight */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
        <Skeleton className="h-4 w-48 bg-slate-800 rounded-full" />
        <Skeleton className="h-7 w-80 bg-slate-800" />
        <Skeleton className="h-12 w-full max-w-2xl bg-slate-800 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-44 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
