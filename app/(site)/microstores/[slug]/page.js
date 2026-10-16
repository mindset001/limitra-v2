import { MicroStorePage } from '@/components/pages/MicroStorePage';

export default async function MicroStoreRoutePage({ params }) {
  const { slug } = await params;
  return <MicroStorePage slug={slug} />;
}
