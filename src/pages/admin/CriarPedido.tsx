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
  IconButton,
  Box
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

interface ItemPedido {
  produto: Produto;
  produtoId?: string;
  quantidade: number;
  precoUnitario: number;
  peso?: number;
  observacao?: string;
}

const CriarPedido: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [selectedProduto, setSelectedProduto] = useState<string>('');
  const [metros, setMetros] = useState<string>('');
  const [itemObservacao, setItemObservacao] = useState<string>('');
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const [formaPagamento, setFormaPagamento] = useState<string>('avista');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>('avista');
  const [detalhePrazo, setDetalhePrazo] = useState<string>('');
  
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
    const metrosNum = parseFloat(metros.replace(',', '.'));
    if (!selectedProduto || isNaN(metrosNum) || metrosNum <= 0) {
      setSnackbar({
        open: true,
        message: 'Selecione um produto e informe a metragem (em metros)',
        severity: 'error'
      });
      return;
    }
    const produto = produtos.find(p => p._id === selectedProduto || p.id?.toString() === selectedProduto);
    if (!produto) return;
    const precoUnitario = produto.precoAVista || produto.preco?.valor || 0;
    const novoItem: ItemPedido = {
      produto,
      produtoId: produto._id || produto.id?.toString(),
      quantidade: metrosNum,
      precoUnitario,
      peso: produto.pesoPorMetro,
      observacao: itemObservacao
    };
    setItens([...itens, novoItem]);
    setSelectedProduto('');
    setMetros('');
    setItemObservacao('');
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
      
      console.log('[CriarPedido] User object:', user);
      console.log('[CriarPedido] Selected cliente:', selectedCliente);
      console.log('[CriarPedido] Itens:', itens);
      
      if (!user || !(user._id || user.id)) {
        console.error('Erro ao criar pedido: Usuário não identificado');
        alert('Erro: usuário não identificado. Faça login novamente.');
        return;
      }
      
      const pedidoData = {
        clienteId: selectedCliente,
        representante: user._id || user.id || '',
        itens: itens.map(item => ({
          produtoId: item.produtoId || '',
          quantidade: item.quantidade,
          valorUnitario: item.precoUnitario,
          valorTotal: item.quantidade * item.precoUnitario
        })),
        valorTotal: itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0),
        condicaoPagamento: condicaoPagamento as 'avista' | 'aprazo',
        pesoTotal: itens.reduce((total, item) => total + (item.quantidade * (item.peso || 0)), 0),
        observacoes: observacoes,
        ...(condicaoPagamento === 'aprazo' ? { detalhePrazo } : {})
      };

      console.log('[CriarPedido] Dados do pedido a serem enviados:', JSON.stringify(pedidoData, null, 2));

      await pedidoService.criar(pedidoData);
      setSnackbar({
        open: true,
        message: 'Pedido criado com sucesso!',
        severity: 'success'
      });
      navigate('/admin/pedidos');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      console.error('Detalhes do erro:', error.response?.data);
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

  const produtoSelecionado = produtos.find(p => p._id === selectedProduto || p.id?.toString() === selectedProduto);

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
        Criar Novo Pedido (Admin)
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

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={formaPagamento}
                    label="Forma de Pagamento"
                    onChange={e => setFormaPagamento(e.target.value)}
                    required
                  >
                    <MenuItem value="avista">À vista</MenuItem>
                    <MenuItem value="credito">Cartão de Crédito</MenuItem>
                    <MenuItem value="debito">Cartão de Débito</MenuItem>
                    <MenuItem value="pix">Pix</MenuItem>
                    <MenuItem value="boleto">Boleto</MenuItem>
                    <MenuItem value="transferencia">Transferência</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Condição de Pagamento</InputLabel>
                  <Select
                    value={condicaoPagamento}
                    label="Condição de Pagamento"
                    onChange={e => setCondicaoPagamento(e.target.value)}
                    required
                  >
                    <MenuItem value="avista">À vista</MenuItem>
                    <MenuItem value="aprazo">A prazo</MenuItem>
                  </Select>
                </FormControl>

                {condicaoPagamento === 'aprazo' && (
                  <TextField
                    fullWidth
                    label="Detalhe do Prazo (ex: 30 dias, 2x, etc)"
                    value={detalhePrazo}
                    onChange={e => setDetalhePrazo(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                  />
                )}

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
                  <FormControl style={{ flex: 2 }}>
                    <InputLabel>Produto</InputLabel>
                    <Select
                      value={selectedProduto}
                      onChange={(e) => setSelectedProduto(e.target.value)}
                      displayEmpty
                      renderValue={val => {
                        if (!val) return 'Selecione o produto';
                        const prod = produtos.find(p => p._id === val || p.id?.toString() === val);
                        return prod ? `${prod.nome} - ${prod.codigo}` : 'Selecione o produto';
                      }}
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
                    label="Metros"
                    value={metros}
                    onChange={e => setMetros(e.target.value)}
                    inputProps={{ step: '0.01', min: '0' }}
                    style={{ width: 100 }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 120 }}>
                    <Typography variant="body2" color="textSecondary">
                      Preço/metro:
                    </Typography>
                    <Typography variant="subtitle2">
                      {produtoSelecionado ? formatarPreco(produtoSelecionado.precoAVista || produtoSelecionado.preco?.valor || 0) : '--'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 120 }}>
                    <Typography variant="body2" color="textSecondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="subtitle2">
                      {selectedProduto && metros ? formatarPreco((produtoSelecionado?.precoAVista || 0) * parseFloat(metros.replace(',', '.')) || 0) : '--'}
                    </Typography>
                  </Box>
                </div>
                <TextField
                  fullWidth
                  label="Observação do item (opcional)"
                  value={itemObservacao}
                  onChange={e => setItemObservacao(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {itens.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell align="right">Metros</TableCell>
                          <TableCell align="right">Preço/metro</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                          <TableCell>Observação</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {itens.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.produto.nome}</TableCell>
                            <TableCell align="right">{item.quantidade}</TableCell>
                            <TableCell align="right">{formatarPreco(item.precoUnitario)}</TableCell>
                            <TableCell align="right">{formatarPreco(item.quantidade * item.precoUnitario)}</TableCell>
                            <TableCell>{item.observacao}</TableCell>
                            <TableCell align="center">
                              <IconButton color="error" size="small" onClick={() => removerItem(index)}>
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
            onClick={() => navigate('/admin/pedidos')}
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