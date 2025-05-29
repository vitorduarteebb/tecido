import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Autocomplete,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Produto } from '../../types/produto';
import { clienteService } from '../../services/clienteService';
import { produtoService } from '../../services/produtoService';
import { pedidoService, ItemPedido as ItemPedidoAPI } from '../../services/pedidoService';
import { useSelector } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import { Cliente } from '../../types';

interface ItemPedido {
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

const CriarPedido: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoDialogOpen, setProdutoDialogOpen] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtoTemp, setProdutoTemp] = useState<Produto | null>(null);
  const [quantidadesTemp, setQuantidadesTemp] = useState<{ [produtoId: string]: number }>({});
  const [observacoes, setObservacoes] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [condicaoPagamento, setCondicaoPagamento] = useState<'avista' | 'aprazo'>('avista');
  const pesoTotal = itensPedido.reduce((total, item) => total + (item.produto.pesoPorMetro * item.quantidade), 0);
  const [detalhePrazo, setDetalhePrazo] = useState('');

  const steps = ['Selecionar Cliente', 'Adicionar Produtos', 'Revisar e Finalizar'];

  useEffect(() => {
    if (user && user.id) {
      clienteService.listar().then((todos) => {
        console.log('Clientes retornados do backend:', todos);
        const vinculados = todos.filter((c: any) => {
          const reps = c.representantes || [];
          return reps.includes(user.id);
        });
        setClientes(vinculados);
      });
      produtoService.listar().then(setProdutos);
    }
  }, [user]);

  useEffect(() => {
    setItensPedido(prevItens => prevItens.map(item => {
      const valorUnitario = condicaoPagamento === 'avista' ? item.produto.precoAVista : item.produto.precoAPrazo;
      const valorTotal = valorUnitario * item.quantidade;
      return {
        ...item,
        valorUnitario,
        valorTotal,
      };
    }));
  }, [condicaoPagamento]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddProduto = () => {
    if (produtoTemp && quantidadesTemp[produtoTemp.id] > 0) {
      const valorUnitario = condicaoPagamento === 'avista' ? produtoTemp.precoAVista : produtoTemp.precoAPrazo;
      const valorTotal = valorUnitario * quantidadesTemp[produtoTemp.id];
      setItensPedido([
        ...itensPedido,
        {
          produto: produtoTemp,
          quantidade: quantidadesTemp[produtoTemp.id],
          valorUnitario,
          valorTotal,
        },
      ]);
      setProdutoDialogOpen(false);
      setProdutoTemp(null);
      setQuantidadesTemp({});
    }
  };

  const handleRemoveItem = (index: number) => {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!clienteSelecionado || itensPedido.length === 0) return;
    if (condicaoPagamento === 'aprazo' && (!detalhePrazo || detalhePrazo.trim() === '')) {
      setSnackbar({ open: true, message: 'Informe o detalhe do prazo para condição a prazo', severity: 'error' });
      return;
    }
    try {
      const pedido = {
        cliente: clienteSelecionado.id,
        representante: user.id,
        itens: itensPedido.map(item => ({
          produto: (item.produto.id || item.produto._id) + '',
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
        })),
        valorTotal: itensPedido.reduce((total, item) => total + item.valorTotal, 0),
        condicaoPagamento,
        detalhePrazo: condicaoPagamento === 'aprazo' ? detalhePrazo : undefined,
        pesoTotal,
        observacoes,
      };
      await pedidoService.criar(pedido);
      setSnackbar({ open: true, message: 'Pedido criado com sucesso!', severity: 'success' });
      setTimeout(() => {
        window.location.href = '/representante/pedidos';
      }, 1200);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao criar pedido', severity: 'error' });
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={clientes}
              getOptionLabel={(cliente) => cliente ? `${cliente.razaoSocial || cliente.nomeFantasia || 'Sem nome'} (${cliente.cnpj || ''})` : ''}
              value={clienteSelecionado}
              onChange={(_, newValue) => setClienteSelecionado(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecione o Cliente"
                  required
                  fullWidth
                />
              )}
            />
            {clienteSelecionado && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Dados do Cliente
                </Typography>
                <Typography>CNPJ: {clienteSelecionado.cnpj}</Typography>
                <Typography>Email: {clienteSelecionado.email}</Typography>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setProdutoDialogOpen(true)}
            >
              Adicionar Produto
            </Button>

            {itensPedido.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Valor Unit.</TableCell>
                      <TableCell align="right">Valor Total</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itensPedido.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.produto.codigo}</TableCell>
                        <TableCell>{item.produto.nome}</TableCell>
                        <TableCell align="right">
                          {item.quantidade} {item.produto.preco.unidade}
                        </TableCell>
                        <TableCell align="right">
                          R$ {item.valorUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          R$ {item.valorTotal.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>Total do Pedido:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          R$ {itensPedido
                            .reduce((total, item) => total + item.valorTotal, 0)
                            .toFixed(2)}
                        </strong>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog
              open={produtoDialogOpen}
              onClose={() => setProdutoDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Adicionar Produto</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Buscar produto"
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  sx={{ mb: 2, mt: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" />,
                  }}
                />

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Imagem</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Preço</TableCell>
                        <TableCell align="right">Estoque</TableCell>
                        <TableCell align="center">Quantidade</TableCell>
                        <TableCell align="center">Subtotal</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {produtosFiltrados.map((produto) => {
                        const quantidade = quantidadesTemp[produto.id] ?? 1;
                        const valorUnitario = produto.preco.valor;
                        const unidade = produto.preco.unidade || 'metro';
                        const estoqueDisponivel = produto.estoque.quantidade;
                        const subtotal = valorUnitario * quantidade;
                        return (
                          <TableRow key={produto.id}>
                            <TableCell>
                              {produto.imagem ? (
                                <img src={produto.imagem} alt={produto.nome} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                              ) : (
                                <Box sx={{ width: 48, height: 48, bgcolor: '#eee', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                  N/A
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>{produto.codigo}</TableCell>
                            <TableCell>{produto.nome}</TableCell>
                            <TableCell align="right">
                              R$ {valorUnitario.toFixed(2)}/{unidade}
                            </TableCell>
                            <TableCell align="right">
                              {estoqueDisponivel} {produto.estoque.unidade}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => setQuantidadesTemp(qt => ({ ...qt, [produto.id]: Math.max(0.1, parseFloat(((qt[produto.id] ?? 1) - 0.1).toFixed(2))) }))}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <TextField
                                  type="number"
                                  value={quantidade}
                                  onChange={(e) => {
                                    let val = parseFloat(e.target.value);
                                    if (isNaN(val)) val = 0.1;
                                    if (val < 0.1) val = 0.1;
                                    if (val > estoqueDisponivel) val = estoqueDisponivel;
                                    setQuantidadesTemp(qt => ({ ...qt, [produto.id]: Number(val.toFixed(2)) }));
                                  }}
                                  inputProps={{ min: 0.1, max: estoqueDisponivel, step: 0.01, style: { textAlign: 'center', width: '70px' } }}
                                  sx={{ mr: 1, ml: 1 }}
                                />
                                <Typography variant="body2" sx={{ minWidth: 40 }}>{unidade}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => setQuantidadesTemp(qt => ({ ...qt, [produto.id]: Math.min(estoqueDisponivel, parseFloat(((qt[produto.id] ?? 1) + 0.1).toFixed(2))) }))}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="text.primary">
                                R$ {subtotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant={quantidadesTemp[produto.id] > 0 ? "contained" : "outlined"}
                                onClick={() => {
                                  setProdutoTemp(produto);
                                  setQuantidadesTemp(qt => ({ ...qt, [produto.id]: qt[produto.id] ?? 1 }));
                                }}
                              >
                                {quantidadesTemp[produto.id] > 0 ? "Selecionado" : "Selecionar"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setProdutoDialogOpen(false)}>Cancelar</Button>
                <Button
                  variant="contained"
                  onClick={handleAddProduto}
                  disabled={!produtoTemp}
                >
                  Adicionar ao Pedido
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Resumo do Pedido</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography>Condição de Pagamento:</Typography>
                <select
                  value={condicaoPagamento}
                  onChange={e => setCondicaoPagamento(e.target.value as 'avista' | 'aprazo')}
                  style={{ padding: 8, fontSize: 16, marginTop: 8 }}
                >
                  <option value="avista">À Vista</option>
                  <option value="aprazo">A Prazo</option>
                </select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>Peso Total: {pesoTotal.toFixed(2)} kg</Typography>
              </Grid>
              {condicaoPagamento === 'aprazo' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Detalhe do Prazo (ex: 30/60/90 dias)"
                    value={detalhePrazo}
                    onChange={e => setDetalhePrazo(e.target.value)}
                    required={condicaoPagamento === 'aprazo'}
                  />
                </Grid>
              )}
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Dados do Cliente
                </Typography>
                {clienteSelecionado && (
                  <>
                    <Typography>Nome: {clienteSelecionado.razaoSocial || clienteSelecionado.nomeFantasia || 'Sem nome'}</Typography>
                    <Typography>CNPJ: {clienteSelecionado.cnpj}</Typography>
                    <Typography>Email: {clienteSelecionado.email}</Typography>
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Produtos
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Quantidade</TableCell>
                        <TableCell align="right">Valor Unit.</TableCell>
                        <TableCell align="right">Valor Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itensPedido.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.produto.codigo}</TableCell>
                          <TableCell>{item.produto.nome}</TableCell>
                          <TableCell align="right">
                            {item.quantidade} {item.produto.preco.unidade}
                          </TableCell>
                          <TableCell align="right">
                            R$ {item.valorUnitario.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            R$ {item.valorTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Total do Pedido:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            R$ {itensPedido
                              .reduce((total, item) => total + item.valorTotal, 0)
                              .toFixed(2)}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observações"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!clienteSelecionado;
      case 1:
        return itensPedido.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Criar Novo Pedido
      </Typography>

      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Voltar
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isStepValid()}
          >
            Finalizar Pedido
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            Próximo
          </Button>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default CriarPedido; 