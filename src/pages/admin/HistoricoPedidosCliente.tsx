import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { clienteService } from '../../services/clienteService';
import { Cliente } from '../../types';

interface Pedido {
  id: string;
  data: string;
  valor: number;
  status: string;
}

const HistoricoPedidosCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [clienteData, pedidosData] = await Promise.all([
          clienteService.obterPorId(id),
          clienteService.listarPedidos(id)
        ]);
        setCliente(clienteData);
        setPedidos(pedidosData);
        setError('');
      } catch (err) {
        setError('Erro ao carregar os dados do cliente e pedidos');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id]);

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'aprovado':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'em processamento':
        return 'info';
      case 'enviado':
        return 'primary';
      case 'entregue':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/clientes')}
        className="mb-4"
      >
        Voltar para Lista de Clientes
      </Button>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {cliente && (
        <div className="mb-6">
          <Typography variant="h4" component="h1" gutterBottom>
            Histórico de Pedidos
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Cliente: {cliente.razaoSocial}
            {cliente.nomeFantasia && ` (${cliente.nomeFantasia})`}
          </Typography>
        </div>
      )}

      {pedidos.length === 0 ? (
        <Alert severity="info">
          Este cliente ainda não possui pedidos registrados.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número do Pedido</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id} hover style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/pedidos/${pedido.id}`)}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{formatarData(pedido.data)}</TableCell>
                  <TableCell>{formatarValor(pedido.valor)}</TableCell>
                  <TableCell>
                    <Chip
                      label={pedido.status}
                      color={getStatusColor(pedido.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default HistoricoPedidosCliente; 