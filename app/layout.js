import { Inter } from 'next/font/google';
import './styles/globals.css'; // CORRIGIDO (está na mesma pasta 'app')
import InstagramLink from './components/InstagramLink'; // CORRIGIDO (está na mesma pasta 'app')

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Amélia Amado Nails - Agendamentos',
  description: 'Agende seu horário conosco.',
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