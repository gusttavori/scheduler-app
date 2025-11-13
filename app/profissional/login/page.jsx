"use client"; // Necessário para usar hooks como useState e useRouter

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Hook para redirecionamento
import { Lock, ArrowRight } from 'lucide-react';

/* CORREÇÃO AQUI: O caminho do CSS mudou de ../styles para ../../styles 
*/
import styles from '../../styles/Login.module.css'; 

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // -----------------------------------------------------------------
  // IMPORTANTE: Altere este código para o seu código de acesso real
  // -----------------------------------------------------------------
  const CODIGO_DE_ACESSO = "miguelsamuel"; // Exemplo: "123456"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simula uma verificação
    // Em um app real, você poderia fazer uma chamada de API aqui
    setTimeout(() => {
      if (code === CODIGO_DE_ACESSO) {
        // Sucesso: Redireciona para o dashboard
        router.push('/profissional/dashboard');
      } else {
        // Erro: Mostra a mensagem
        setError("Código de acesso incorreto.");
        setIsLoading(false);
        setCode(""); // Limpa o campo
      }
    }, 500); // Meio segundo de delay para simular o carregamento
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <form onSubmit={handleSubmit}>
          <h2>Painel Administrativo</h2>
          <p className={styles.subtitle}>
            Insira o código de acesso para continuar.
          </p>
          
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type="password"
              id="accessCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de Acesso"
              required
              className={styles.inputField}
              disabled={isLoading}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button 
            type="submit" 
            className={styles.ctaButton} 
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Acessar"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      <div className={styles.backLinkContainer}>
        <Link href="/" className={styles.backLink}>
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}