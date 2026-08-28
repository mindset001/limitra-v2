import { AuthPage } from '@/components/pages/AuthPage';

export default async function AuthModePage({ params }) {
  const { mode } = await params;
  return <AuthPage mode={mode || 'signin'} />;
}
