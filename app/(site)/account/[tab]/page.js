import { AccountPage } from '@/components/pages/Account';

export default async function AccountTabPage({ params }) {
  const { tab } = await params;
  return <AccountPage tab={tab} />;
}
