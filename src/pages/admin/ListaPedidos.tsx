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
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { pedidoService, Pedido } from '../../services/pedidoService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PedidoPDF from '../../components/PedidoPDF';

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidoService.listar();
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMudarStatus = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setDialogOpen(true);
  };

  const confirmarMudancaStatus = async () => {
    if (!selectedPedido) return;

    try {
      await pedidoService.atualizarStatus(selectedPedido._id || selectedPedido.id || '', selectedPedido.status || '');
      await carregarPedidos();
      setDialogOpen(false);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDENTE': return 'warning';
      case 'APROVADO': return 'info';
      case 'EM_PRODUCAO': return 'primary';
      case 'PRONTO': return 'success';
      case 'ENTREGUE': return 'default';
      case 'CANCELADO': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'APROVADO': return 'Aprovado';
      case 'EM_PRODUCAO': return 'Em Produção';
      case 'PRONTO': return 'Pronto';
      case 'ENTREGUE': return 'Entregue';
      case 'CANCELADO': return 'Cancelado';
      default: return status || 'Pendente';
    }
  };

  const pedidosFiltrados = statusFilter === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.status === statusFilter);

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

  const getClienteNome = (cliente: string | { razaoSocial?: string; nomeFantasia?: string; nome?: string; cnpj?: string; id?: string }) => {
    if (typeof cliente === 'string') return cliente;
    return cliente.nome || cliente.razaoSocial || cliente.nomeFantasia || 'Cliente';
  };

  const getRepresentanteNome = (representante: string | { nome?: string; razaoSocial?: string; id?: string }) => {
    if (typeof representante === 'string') return representante;
    return representante.nome || representante.razaoSocial || 'Representante';
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
        Lista de Pedidos
      </Typography>

      <FormControl style={{ marginBottom: 20, minWidth: 200 }}>
        <InputLabel>Filtrar por Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="PENDENTE">Pendente</MenuItem>
          <MenuItem value="APROVADO">Aprovado</MenuItem>
          <MenuItem value="EM_PRODUCAO">Em Produção</MenuItem>
          <MenuItem value="PRONTO">Pronto</MenuItem>
          <MenuItem value="ENTREGUE">Entregue</MenuItem>
          <MenuItem value="CANCELADO">Cancelado</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Representante</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.map((pedido) => (
              <TableRow key={pedido._id || pedido.id}>
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
                <TableCell>{formatarPreco(pedido.valorTotal)}</TableCell>
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
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <PDFDownloadLink
                    document={<PedidoPDF 
                      numeroPedido={pedido._id || pedido.id || ''}
                      cliente={{
                        nome: getClienteNome(pedido.cliente),
                        cnpj: typeof pedido.cliente === 'object' ? pedido.cliente.cnpj || '' : '',
                        endereco: ''
                      }}
                      produtos={pedido.itens.map(item => ({
                        id: typeof item.produto === 'string' ? item.produto : '',
                        nome: typeof item.produto === 'string' ? item.produto : 'Produto',
                        quantidade: item.quantidade,
                        valorUnitario: item.valorUnitario,
                        subtotal: item.valorTotal
                      }))}
                      valorTotal={pedido.valorTotal}
                      dataPedido={pedido.dataCriacao || pedido.data || ''}
                      dataPrevisao={''}
                    />}
                    fileName={`pedido-${pedido._id || pedido.id}.pdf`}
                  >
                    {({ loading }) => (
                      <Tooltip title="Baixar PDF">
                        <IconButton size="small" disabled={loading}>
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </PDFDownloadLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Mudar Status do Pedido</DialogTitle>
        <DialogContent>
          <FormControl fullWidth style={{ marginTop: 16 }}>
            <InputLabel>Novo Status</InputLabel>
            <Select
              value={selectedPedido?.status || ''}
              onChange={(e) => setSelectedPedido(prev => prev ? { ...prev, status: e.target.value } : null)}
            >
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="APROVADO">Aprovado</MenuItem>
              <MenuItem value="EM_PRODUCAO">Em Produção</MenuItem>
              <MenuItem value="PRONTO">Pronto</MenuItem>
              <MenuItem value="ENTREGUE">Entregue</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
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
  );
};

export default ListaPedidos; 