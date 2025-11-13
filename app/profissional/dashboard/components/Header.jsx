"use client"; // Necessário para o user-info (se for dinâmico)

import React from 'react';

export default function Header() {
  
  return (
    <header className="header">
      {/* Título do Painel (adicionado) */}
      <h2>Painel Administrativo</h2>
    </header>
  );
}