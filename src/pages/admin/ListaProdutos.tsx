import React from 'react';

const ListaProdutos: React.FC = () => {
  console.log('[ListaProdutos] Componente sendo renderizado - versão ultra simplificada');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Lista de Produtos - Teste</h1>
      <p>Se você está vendo esta mensagem, o componente está funcionando!</p>
      <p>Produtos carregados: 0 (versão de teste)</p>
    </div>
  );
};

export default ListaProdutos; 