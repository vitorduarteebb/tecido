import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { produtoService } from '../../services/produtoService';
import { Produto } from '../../types/produto';

const ListaProdutos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtoService.excluir(id);
        await carregarProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const formatarPreco = (preco: { valor: number; unidade: 'metro' | 'kg' }) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco.valor);
  };

  const formatarEstoque = (estoque: { quantidade: number; unidade: 'metro' | 'kg' }) => {
    return `${estoque.quantidade} ${estoque.unidade}`;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4">
          Lista de Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/produtos/novo')}
        >
          Novo Produto
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagem</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Estoque</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto._id || produto.id}>
                <TableCell>
                  {produto.imagem ? (
                    <img 
                      src={produto.imagem} 
                      alt={produto.nome}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Sem imagem
                      </Typography>
                    </div>
                  )}
                </TableCell>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>{produto.codigo}</TableCell>
                <TableCell>{produto.categoria}</TableCell>
                <TableCell>{formatarPreco(produto.preco)}</TableCell>
                <TableCell>{formatarEstoque(produto.estoque)}</TableCell>
                <TableCell>
                  <Chip 
                    label={produto.status === 'ativo' ? 'Ativo' : 'Inativo'} 
                    color={produto.status === 'ativo' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Visualizar">
                    <IconButton 
                      onClick={() => navigate(`/admin/produtos/${produto._id || produto.id}`)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton 
                      onClick={() => navigate(`/admin/produtos/${produto._id || produto.id}/editar`)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton 
                      onClick={() => handleExcluir(produto._id || produto.id?.toString() || '')}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ListaProdutos; 