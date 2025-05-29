import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import api from '../../services/api';
import { orcamentoService } from '../../services/orcamentoService';

interface Orcamento {
  _id: string;
  cliente: { razaoSocial?: string; nome?: string };
  produto: { nome: string; codigo: string };
  quantidade: number;
  status: string;
  dataSolicitacao: string;
}

const Orcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orcamentos/representante');
      setOrcamentos(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar solicitações de orçamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const handleMarcarComoLido = async (id: string) => {
    await orcamentoService.atualizarStatus(id, 'lido');
    fetchOrcamentos();
    // Opcional: pode-se emitir um evento ou usar contexto para atualizar badge no Layout
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Solicitações de Orçamento Recebidas
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orcamentos.map((orc) => (
                <TableRow key={orc._id}>
                  <TableCell>{orc.cliente?.razaoSocial || orc.cliente?.nome || '-'}</TableCell>
                  <TableCell>{orc.produto?.nome} ({orc.produto?.codigo})</TableCell>
                  <TableCell>{orc.quantidade}</TableCell>
                  <TableCell>
                    <Chip label={orc.status} color={orc.status === 'pendente' ? 'warning' : 'success'} size="small" />
                    {orc.status === 'pendente' && (
                      <Button
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={() => handleMarcarComoLido(orc._id)}
                      >
                        Marcar como lido
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{new Date(orc.dataSolicitacao).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Orcamentos; 