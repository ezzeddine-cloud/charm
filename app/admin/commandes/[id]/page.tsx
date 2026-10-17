'use client';

import { useParams } from 'next/navigation';
import { AdminOrdersView } from '@/components/admin/AdminOrdersView';

export default function Page() {
  const params = useParams();
  const id = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';
  return <AdminOrdersView initialOrderId={id} />;
}
