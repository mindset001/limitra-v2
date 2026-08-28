import { ShopPage } from '@/components/pages/ShopPage';

export default async function ShopCatSubPage({ params }) {
  const { cat, sub } = await params;
  return <ShopPage cat={cat} sub={sub} />;
}
