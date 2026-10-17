'use client';

import { useParams } from 'next/navigation';
import { ShopView } from '@/components/store/ShopView';

export default function Page() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  return <ShopView categorySlug={slug} />;
}
