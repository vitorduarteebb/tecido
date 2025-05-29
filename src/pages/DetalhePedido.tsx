import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';

const DetalhePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // TODO: Integrar com API
  const pedido = {
    id: id,
    numero: '#1234',
    data: '2024-03-15',
    status: 'Em Processamento',
    cliente: {
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999'
    },
    representante: {
      nome: 'Carlos Santos',
      email: 'carlos@email.com',
      telefone: '(11) 88888-8888'
    },
    produtos: [
      {
        id: 1,
        nome: 'Tecido Algodão',
        quantidade: 10,
        preco_unitario: 29.90,
        total: 299.00
      },
      {
        id: 2,
        nome: 'Tecido Seda',
        quantidade: 5,
        preco_unitario: 89.90,
        total: 449.50
      }
    ],
    forma_pagamento: 'Boleto',
    data_entrega: '2024-03-20',
    observacoes: 'Entregar no período da manhã',
    valor_total: 748.50
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'Em Processamento': 'warning',
      'Aprovado': 'success',
      'Enviado': 'info',
      'Entregue': 'success',
      'Cancelado': 'error'
    };
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  return (
    <div className="p-4">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Pedido {pedido.numero}
        </Typography>
        <Chip
          label={pedido.status}
          color={getStatusColor(pedido.status) as any}
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Informações do Cliente
            </Typography>
            <Typography><strong>Nome:</strong> {pedido.cliente.nome}</Typography>
            <Typography><strong>Email:</strong> {pedido.cliente.email}</Typography>
            <Typography><strong>Telefone:</strong> {pedido.cliente.telefone}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Informações do Representante
            </Typography>
            <Typography><strong>Nome:</strong> {pedido.representante.nome}</Typography>
            <Typography><strong>Email:</strong> {pedido.representante.email}</Typography>
            <Typography><strong>Telefone:</strong> {pedido.representante.telefone}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes do Pedido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography><strong>Data do Pedido:</strong></Typography>
                <Typography>{new Date(pedido.data).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography><strong>Data de Entrega:</strong></Typography>
                <Typography>{new Date(pedido.data_entrega).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography><strong>Forma de Pagamento:</strong></Typography>
                <Typography>{pedido.forma_pagamento}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography><strong>Valor Total:</strong></Typography>
                <Typography color="primary" sx={{ fontWeight: 'bold' }}>
                  R$ {pedido.valor_total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Produtos
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell align="right">Quantidade</TableCell>
                    <TableCell align="right">Preço Unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedido.produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell align="right">{produto.quantidade}</TableCell>
                      <TableCell align="right">R$ {produto.preco_unitario.toFixed(2)}</TableCell>
                      <TableCell align="right">R$ {produto.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total do Pedido:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>R$ {pedido.valor_total.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {pedido.observacoes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
              <Typography>{pedido.observacoes}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default DetalhePedido; 