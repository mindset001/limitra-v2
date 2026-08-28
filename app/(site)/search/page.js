import { Suspense } from 'react';
import { SearchPage } from '@/components/pages/ShopPage';

async function SearchBody({ searchParams }) {
  const { q } = await searchParams;
  return <SearchPage q={q} />;
}

export default function SearchRoutePage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <SearchBody searchParams={searchParams} />
    </Suspense>
  );
}
