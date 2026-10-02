import { AdminProducts } from '@/components/admin/Admin';

export default async function AdminProductDetailPage({ params }) {
  const { id } = await params;
  return <AdminProducts editId={id} />;
}
