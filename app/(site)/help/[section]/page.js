import { HelpPage } from '@/components/pages/Account';

export default async function HelpSectionPage({ params }) {
  const { section } = await params;
  return <HelpPage section={section} />;
}
