'use client';

import { Suspense } from 'react';
import LocalItineraryBuilder from '@/components/LocalItineraryBuilder';

/**
 * Page: /local/builder
 * Giao diện tạo lịch trình Local mẫu
 */
export default function LocalBuilderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <LocalItineraryBuilder />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-lg" />
          ))}
        </div>
        <div className="md:col-span-2 h-96 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}
