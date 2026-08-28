import { Quicksand } from 'next/font/google';
import '@/styles/styles.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata = {
  title: 'Limitra, Premium Tech Marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body>{children}</body>
    </html>
  );
}
