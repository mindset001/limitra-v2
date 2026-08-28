import { ShopPage } from '@/components/pages/ShopPage';

export default async function ShopCatPage({ params }) {
  const { cat } = await params;
  return <ShopPage cat={cat} />;
}
