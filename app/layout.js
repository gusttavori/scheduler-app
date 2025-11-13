import { Inter } from 'next/font/google';
import './styles/globals.css';
import InstagramLink from './components/InstagramLink';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Amélia Amado Nails - Agendamentos',
  description: 'Agende seu horário conosco.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main>{children}</main>
        <InstagramLink />
      </body>
    </html>
  );
}