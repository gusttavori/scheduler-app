import Link from 'next/link';
// 1. Importa os estilos da PÁGINA
import pageStyles from '../styles/SucessoPage.module.css'; 
// 2. Importa os estilos do POP-UP
import popupStyles from '../styles/SuccessPopup.module.css'; 

export default function SucessoPage() {
  return (
    // 3. Usa o estilo da PÁGINA para centralizar
    <div className={pageStyles.pageContainer}>
      
      {/* 4. Usa os estilos do POP-UP para o card */}
      <div className={popupStyles.successPopup}>
        ✨ Agendamento confirmado com sucesso!
        <br /><br />
        Entraremos em contato pelo WhatsApp.

        {/* 5. Usa o estilo do BOTÃO do pop-up */}
        <Link href="/" className={popupStyles.backButton}>
          Voltar para o Início
        </Link>
      </div>

    </div>
  );
}