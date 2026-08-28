import { TrackingPage } from '@/components/pages/Account';

export default async function TrackingRoutePage({ params }) {
  const { id } = await params;
  return <TrackingPage id={id} />;
}
