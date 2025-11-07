import Link from 'next/link';
import { Instagram } from 'lucide-react'; // Importa o ícone corretamente
import styles from '../styles/Instagram.module.css';

export default function InstagramLink() {
  return (
    <Link
      href="https://www.instagram.com/ameliaamadonails"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.instaLink}
    >
      <Instagram size={16} className={styles.icon} /> 
      <span>Siga no Instagram: </span> <strong>@ameliaamadonails</strong>
    </Link>
  );
}
