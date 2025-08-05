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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Pending as PendingIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { pedidoService, Pedido as PedidoAPI } from '../../services/pedidoService';
import DebugWrapper from '../../components/DebugWrapper';
import { debugLogger } from '../../utils/debug';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pedidos-tabpanel-${index}`}
      aria-labelledby={`pedidos-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ListaPedidos: React.FC = () => {
  debugLogger.info('ListaPedidos - Iniciando renderização');
  
  const [pedidos, setPedidos] = useState<PedidoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<PedidoAPI | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchNumero, setSearchNumero] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    debugLogger.info('ListaPedidos - useEffect executado');
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      console.log('[ListaPedidos] Iniciando carregamento de pedidos...');
      debugLogger.info('ListaPedidos - Iniciando carregamento de pedidos');
      setLoading(true);
      const data = await pedidoService.listar();
      console.log('[ListaPedidos] Pedidos carregados com sucesso:', data);
      debugLogger.info('ListaPedidos - Pedidos carregados com sucesso', { count: data.length });
      setPedidos(data);
    } catch (error) {
      console.error('[ListaPedidos] Erro ao carregar pedidos:', error);
      debugLogger.error('ListaPedidos - Erro ao carregar pedidos', { error });
      setSnackbar({
        open: true,
        message: 'Erro ao carregar pedidos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarPorNumero = async () => {
    if (!searchNumero.trim()) {
      carregarPedidos();
      return;
    }

    try {
      setLoading(true);
      const pedido = await pedidoService.obterPorNumero(searchNumero.trim());
      setPedidos([pedido]);
      setSnackbar({
        open: true,
        message: `Pedido ${searchNumero} encontrado`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      setSnackbar({
        open: true,
        message: `Pedido ${searchNumero} não encontrado`,
        severity: 'warning'
      });
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const limparBusca = () => {
    setSearchNumero('');
    carregarPedidos();
  };

  const handleMudarStatus = (pedido: PedidoAPI) => {
    debugLogger.info('ListaPedidos - Mudando status do pedido', { pedidoId: pedido._id || pedido.id });
    setSelectedPedido(pedido);
    setDialogOpen(true);
  };

  const confirmarMudancaStatus = async () => {
    if (!selectedPedido) return;

    try {
      debugLogger.info('ListaPedidos - Confirmando mudança de status', { 
        pedidoId: selectedPedido._id || selectedPedido.id,
        novoStatus: selectedPedido.status 
      });
      await pedidoService.atualizarStatus(selectedPedido._id || selectedPedido.id || '', selectedPedido.status || '');
      await carregarPedidos();
      setDialogOpen(false);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      debugLogger.error('ListaPedidos - Erro ao atualizar status', { error });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
      case 'aguardando aprovação':
        return 'warning';
      case 'em separação':
      case 'em produção':
        return 'info';
      case 'faturado':
      case 'pronto':
        return 'success';
      case 'entregue':
        return 'default';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
      case 'aguardando aprovação':
        return 'Pendente';
      case 'em separação':
        return 'Em Separação';
      case 'em produção':
        return 'Em Produção';
      case 'faturado':
        return 'Faturado';
      case 'pronto':
        return 'Pronto';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status || 'Pendente';
    }
  };

  // Função para verificar se o pedido é novo (últimas 2 horas)
  const isPedidoNovo = (pedido: PedidoAPI) => {
    if (!pedido.dataCriacao) return false;
    const dataPedido = new Date(pedido.dataCriacao);
    const agora = new Date();
    const diffHoras = (agora.getTime() - dataPedido.getTime()) / (1000 * 60 * 60);
    return diffHoras <= 2;
  };

  // Categorizar pedidos por status
  const pedidosPendentes = pedidos.filter(p => 
    p.status?.toLowerCase() === 'pendente' || 
    p.status?.toLowerCase() === 'aguardando aprovação'
  );
  
  const pedidosEmSeparacao = pedidos.filter(p => 
    p.status?.toLowerCase() === 'em separação' || 
    p.status?.toLowerCase() === 'em produção'
  );
  
  const pedidosFaturados = pedidos.filter(p => 
    p.status?.toLowerCase() === 'faturado' || 
    p.status?.toLowerCase() === 'pronto'
  );

  const pedidosEnviados = pedidos.filter(p => 
    p.status?.toLowerCase() === 'enviado'
  );
  
  const pedidosEntregues = pedidos.filter(p => 
    p.status?.toLowerCase() === 'entregue'
  );

  const pedidosCancelados = pedidos.filter(p => 
    p.status?.toLowerCase() === 'cancelado'
  );

  const formatarData = (data?: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getClienteNome = (cliente: string | { razaoSocial?: string; nomeFantasia?: string; nome?: string; cnpj?: string; id?: string } | null | undefined) => {
    if (!cliente) return 'Cliente não informado';
    if (typeof cliente === 'string') return cliente;
    return cliente.nome || cliente.razaoSocial || cliente.nomeFantasia || 'Cliente';
  };

  const getRepresentanteNome = (representante: string | { nome?: string; razaoSocial?: string; id?: string; tipo?: string } | null | undefined) => {
    if (!representante) return 'Representante não informado';
    if (typeof representante === 'string') return representante;
    const nome = representante.nome || representante.razaoSocial || 'Representante';
    const tipo = representante.tipo === 'admin' ? ' (Admin)' : '';
    return nome + tipo;
  };

  const renderTabelaPedidos = (pedidosParaExibir: PedidoAPI[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Número</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Representante</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Valor Total</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pedidosParaExibir.map((pedido) => (
            <TableRow 
              key={pedido._id || pedido.id}
              sx={{
                backgroundColor: isPedidoNovo(pedido) ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                '&:hover': {
                  backgroundColor: isPedidoNovo(pedido) ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {pedido.numeroPedido || 'N/A'}
                  </Typography>
                  {isPedidoNovo(pedido) && (
                    <Chip 
                      label="Novo" 
                      color="success" 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>{getClienteNome(pedido.cliente)}</TableCell>
              <TableCell>{getRepresentanteNome(pedido.representante)}</TableCell>
              <TableCell>{formatarData(pedido.dataCriacao)}</TableCell>
              <TableCell>
                <Chip 
                  label={getStatusLabel(pedido.status)} 
                  color={getStatusColor(pedido.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatarPreco(pedido.valorTotal || 0)}</TableCell>
              <TableCell>
                <Tooltip title="Visualizar">
                  <IconButton 
                    onClick={() => navigate(`/admin/pedidos/${pedido._id || pedido.id}`)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton 
                    onClick={() => navigate(`/admin/pedidos/${pedido._id || pedido.id}/editar`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mudar Status">
                  <IconButton 
                    onClick={() => handleMudarStatus(pedido)}
                    size="small"
                  >
                    <AssignmentIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <DebugWrapper componentName="ListaPedidos">
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Container>
      </DebugWrapper>
    );
  }

  return (
    <DebugWrapper componentName="ListaPedidos">
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Gestão de Pedidos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/criar-pedido')}
            sx={{ minWidth: 150 }}
          >
            Criar Pedido
          </Button>
        </Box>

        {/* Cards de resumo */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosPendentes.length}
                </Typography>
                <Typography variant="body2">Pendentes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosEmSeparacao.length}
                </Typography>
                <Typography variant="body2">Em Separação</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosFaturados.length}
                </Typography>
                <Typography variant="body2">Faturados</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosEnviados.length}
                </Typography>
                <Typography variant="body2">Enviados</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'grey.500', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosEntregues.length}
                </Typography>
                <Typography variant="body2">Entregues</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidosCancelados.length}
                </Typography>
                <Typography variant="body2">Cancelados</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {pedidos.length}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Busca */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Buscar por Número"
                value={searchNumero}
                onChange={(e) => setSearchNumero(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buscarPorNumero();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={limparBusca}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={buscarPorNumero}
                fullWidth
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Abas */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Badge badgeContent={pedidosPendentes.length} color="warning">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PendingIcon />
                      Pendentes
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={pedidosEmSeparacao.length} color="info">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon />
                      Em Separação
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={pedidosFaturados.length} color="success">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon />
                      Faturados
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={pedidosEnviados.length} color="primary">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon />
                      Enviados
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={pedidosEntregues.length} color="default">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon />
                      Entregues
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={pedidosCancelados.length} color="error">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeleteIcon />
                      Cancelados
                    </Box>
                  </Badge>
                } 
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {pedidosPendentes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido pendente
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosPendentes)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {pedidosEmSeparacao.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido em separação
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosEmSeparacao)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {pedidosFaturados.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido faturado
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosFaturados)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {pedidosEnviados.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido enviado
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosEnviados)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {pedidosEntregues.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido entregue
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosEntregues)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            {pedidosCancelados.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido cancelado
                </Typography>
              </Box>
            ) : (
              renderTabelaPedidos(pedidosCancelados)
            )}
          </TabPanel>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Mudar Status do Pedido</DialogTitle>
          <DialogContent>
            <FormControl fullWidth style={{ marginTop: 16 }}>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={selectedPedido?.status || ''}
                onChange={(e) => setSelectedPedido(prev => prev ? { ...prev, status: e.target.value } : null)}
              >
                <MenuItem value="Pendente">Pendente</MenuItem>
                <MenuItem value="Em Separação">Em Separação</MenuItem>
                <MenuItem value="Em Produção">Em Produção</MenuItem>
                <MenuItem value="Faturado">Faturado</MenuItem>
                <MenuItem value="Pronto">Pronto</MenuItem>
                <MenuItem value="Entregue">Entregue</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmarMudancaStatus} variant="contained">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DebugWrapper>
  );
};

export default ListaPedidos; 