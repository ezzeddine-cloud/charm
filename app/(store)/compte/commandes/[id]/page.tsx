'use client';

import { useParams } from 'next/navigation';
import { AccountOrderDetail } from '@/components/store/AccountView';

export default function Page() {
  const params = useParams();
  const id = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';
  return <AccountOrderDetail orderId={id} />;
}
