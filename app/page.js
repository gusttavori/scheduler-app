import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react'; // Mantém apenas o ícone necessário

import styles from './styles/Home.module.css';

export default function HomePage() {
  return (
    <>
      <div className={styles.container}>
        {/* Logo */}
        <Image
          src="/AmeliaAmadoNails.png"
          alt="Amélia Amado Nails"
          width={260}
          height={60}
          priority
          className={styles.logo}
        />

        {/* Card principal */}
        <div className={styles.welcomeCard}>
          <p className={styles.welcomeText}>
            Bem-vinda ao estúdio. <br />  
            Cada detalhe é pensado para realçar a beleza e o cuidado das suas unhas.
          </p>
        
        <Link href="/agendar" className={styles.ctaButton}>
          <Calendar size={18} className={styles.icon} />
          Agendar horário
        </Link>
        </div>
      </div>
    </>
  );
}
