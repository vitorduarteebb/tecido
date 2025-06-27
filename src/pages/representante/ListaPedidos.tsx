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
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '../../services/pedidoService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      carregarPedidos();
    }
  }, [user]);

  const carregarPedidos = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await pedidoService.listarPorRepresentante(user.id);
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
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
        Meus Pedidos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido._id || pedido.id}>
                <TableCell>{typeof pedido.cliente === 'string' ? pedido.cliente : pedido.cliente?.nome || 'Cliente'}</TableCell>
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
                  <Chip 
                    label="Visualizar" 
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/representante/pedidos/${pedido._id || pedido.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ListaPedidos; 