import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clienteService } from '../../services/clienteService';
import { produtoService } from '../../services/produtoService';
import { pedidoService } from '../../services/pedidoService';
import { Cliente } from '../../types/cliente';
import { Produto } from '../../types/produto';
import Box from '@mui/material/Box';

interface ItemPedido {
  produto: Produto;
  produtoId?: string;
  quantidade: number;
  precoUnitario: number;
  peso?: number;
}

const CriarPedido: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [selectedProduto, setSelectedProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [clientesData, produtosData] = await Promise.all([
        clienteService.listar(),
        produtoService.listar()
      ]);
      setClientes(clientesData);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = () => {
    if (!selectedProduto || quantidade <= 0) {
      setSnackbar({
        open: true,
        message: 'Selecione um produto e informe a quantidade',
        severity: 'error'
      });
      return;
    }

    const produto = produtos.find(p => p._id === selectedProduto || p.id?.toString() === selectedProduto);
    if (!produto) return;

    const novoItem: ItemPedido = {
      produto,
      produtoId: produto._id || produto.id?.toString(),
      quantidade,
      precoUnitario: produto.preco.valor,
      peso: produto.pesoPorMetro
    };

    setItens([...itens, novoItem]);
    setSelectedProduto('');
    setQuantidade(1);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCliente || itens.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione um cliente e adicione pelo menos um item',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      const pedidoData = {
        cliente: selectedCliente,
        representante: user?.id || '',
        itens: itens.map(item => ({
          produto: item.produtoId || '',
          quantidade: item.quantidade,
          valorUnitario: item.precoUnitario,
          valorTotal: item.quantidade * item.precoUnitario
        })),
        valorTotal: itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0),
        condicaoPagamento: 'avista' as const,
        pesoTotal: itens.reduce((total, item) => total + (item.quantidade * (item.peso || 0)), 0),
        observacoes: observacoes
      };

      await pedidoService.criar(pedidoData);
      setSnackbar({
        open: true,
        message: 'Pedido criado com sucesso!',
        severity: 'success'
      });
      navigate('/representante/pedidos');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar pedido. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  if (loading && clientes.length === 0) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Criar Novo Pedido
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações do Pedido
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={selectedCliente}
                    label="Cliente"
                    onChange={(e) => setSelectedCliente(e.target.value)}
                    required
                  >
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.nomeFantasia || cliente.razaoSocial}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observações"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Typography variant="h6">
                    Adicionar Itens
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={adicionarItem}
                  >
                    Adicionar Item
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <FormControl style={{ flex: 1 }}>
                    <InputLabel>Produto</InputLabel>
                    <Select
                      value={selectedProduto}
                      onChange={(e) => setSelectedProduto(e.target.value)}
                    >
                      {produtos.map((produto) => (
                        <MenuItem key={produto._id || produto.id} value={produto._id || produto.id}>
                          {produto.nome} - {produto.codigo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    type="number"
                    label="Quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    style={{ width: 120 }}
                  />
                </div>

                {itens.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Preço Unit.</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {itens.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.produto.nome}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantidade}
                            </TableCell>
                            <TableCell align="right">
                              {formatarPreco(item.precoUnitario)}
                            </TableCell>
                            <TableCell align="right">
                              {formatarPreco(item.quantidade * item.precoUnitario)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => removerItem(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {itens.length > 0 && (
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="h6">
                      Total: {formatarPreco(itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0))}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/representante/pedidos')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            disabled={loading || !selectedCliente || itens.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : 'Criar Pedido'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CriarPedido; 