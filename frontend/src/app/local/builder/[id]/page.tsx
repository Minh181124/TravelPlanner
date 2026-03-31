'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import LocalItineraryBuilder from '@/components/LocalItineraryBuilder';

/**
 * Page: /local/builder/[id]
 * Chỉnh sửa lịch trình Local mẫu (hoặc tạo lịch trình mới nếu không có ID)
 */
export default function LocalBuilderEditPage() {
  const params = useParams();
  const id = params?.id ? parseInt(String(params.id)) : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <LocalItineraryBuilder editId={id} />
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
