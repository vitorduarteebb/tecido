import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Button } from '@mui/material';
import { pedidoService, Pedido } from '../../services/pedidoService';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const ListaPedidos: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      pedidoService.listarPorRepresentante(user.id)
        .then(setPedidos)
        .catch(() => setError('Erro ao carregar pedidos'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Meus Pedidos
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : pedidos.length === 0 ? (
        <Typography>Nenhum pedido encontrado.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Representante</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Valor Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos && pedidos.length > 0 && pedidos.map((pedido) => {
                const clienteNome = typeof pedido.cliente === 'string'
                  ? pedido.cliente
                  : pedido.cliente && (pedido.cliente.razaoSocial || pedido.cliente.nomeFantasia || pedido.cliente.nome || 'Sem nome');
                const representanteNome = typeof pedido.representante === 'string'
                  ? pedido.representante
                  : pedido.representante && (pedido.representante.nome || pedido.representante.razaoSocial || '-');
                const pedidoId = pedido.id || pedido._id || '';
                let dataPedido = '-';
                if (pedido.dataCriacao) {
                  dataPedido = format(new Date(pedido.dataCriacao), 'dd/MM/yyyy');
                } else if (pedido.data) {
                  dataPedido = format(new Date(pedido.data), 'dd/MM/yyyy');
                }
                return (
                  <TableRow key={pedidoId}>
                    <TableCell>{typeof pedidoId === 'string' && pedidoId.slice ? pedidoId.slice(-6).toUpperCase() : pedidoId}</TableCell>
                    <TableCell>{clienteNome}</TableCell>
                    <TableCell>{representanteNome}</TableCell>
                    <TableCell>{pedido.status}</TableCell>
                    <TableCell>{dataPedido}</TableCell>
                    <TableCell>
                      {pedido.itens?.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaPedidos; 