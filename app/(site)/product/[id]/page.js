import { ProductPage } from '@/components/pages/ProductPage';

export default async function ProductRoutePage({ params }) {
  const { id } = await params;
  return <ProductPage id={id} />;
}
