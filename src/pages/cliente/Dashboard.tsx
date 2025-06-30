import React, { useEffect, useState } from 'react';
import { pedidoService } from '../../services/pedidoService';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Table, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress, Chip } from '@mui/material';
import { authService } from '../../services/authService';

const ClienteDashboard: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getUser();
    if (user && user.clienteId) {
      carregarPedidos(user.clienteId);
    } else {
      setLoading(false);
    }
  }, []);

  const carregarPedidos = async (clienteId: string) => {
    try {
      setLoading(true);
      const data = await pedidoService.listarPorCliente(clienteId);
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos do cliente:', error);
    } finally {
      setLoading(false);
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
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>Número</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Valor Total</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pedidos.map((pedido) => (
            <TableRow key={pedido._id || pedido.id}>
              <TableCell>{pedido.numeroPedido || pedido._id || pedido.id}</TableCell>
              <TableCell>{formatarData(pedido.dataCriacao)}</TableCell>
              <TableCell>
                <Chip label={pedido.status || 'Em Separação'} color="primary" size="small" />
              </TableCell>
              <TableCell>{formatarPreco(pedido.valorTotal)}</TableCell>
              <TableCell>
                <Chip 
                  label="Visualizar" 
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/cliente/pedidos/${pedido._id || pedido.id}`)}
                  style={{ cursor: 'pointer' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ClienteDashboard; 