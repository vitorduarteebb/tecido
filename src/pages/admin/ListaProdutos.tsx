import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { produtoService } from '../../services/produtoService';
import { Produto } from '../../types/produto';

const ListaProdutos: React.FC = () => {
  console.log('[ListaProdutos] Componente sendo renderizado');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[ListaProdutos] useEffect executado');
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      console.log('[ListaProdutos] Iniciando carregamento de produtos...');
      setLoading(true);
      const data = await produtoService.listar();
      console.log('[ListaProdutos] Produtos carregados com sucesso:', data);
      setProdutos(data);
    } catch (error) {
      console.error('[ListaProdutos] Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Lista de Produtos (Versão Simplificada)
      </Typography>
      <Typography variant="body1">
        Produtos carregados: {produtos.length}
      </Typography>
      <div>
        {produtos.map((produto) => (
          <div key={produto._id || produto.id}>
            <Typography variant="h6">{produto.nome}</Typography>
            <Typography variant="body2">{produto.codigo}</Typography>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ListaProdutos; 