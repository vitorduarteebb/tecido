import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { representanteService } from '../../services/representanteService';

const MinhasComissoes: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [percentual, setPercentual] = useState<number>(0);

  useEffect(() => {
    const fetchComissoes = async () => {
      if (!user?.id) return;
      setLoading(true);
      const pedidos = await representanteService.historicoVendas(user.id);
      setComissoes(pedidos);
      if (pedidos.length > 0 && pedidos[0].representante && pedidos[0].representante.comissao) {
        setPercentual(Number(pedidos[0].representante.comissao));
      }
      setLoading(false);
    };
    fetchComissoes();
  }, [user]);

  const totalComissoes = comissoes.reduce((acc, p) => acc + ((p.valorTotal || 0) * (percentual || 0) / 100), 0);
  const comissoesPagas = comissoes.filter(c => c.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * (percentual || 0) / 100), 0);
  const comissoesPendentes = comissoes.filter(c => !c.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * (percentual || 0) / 100), 0);

  return (
    <div className="p-4">
      <Typography variant="h5" component="h1" gutterBottom>
        Minhas Comissões
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Comissões
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Comissões Pagas
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                R$ {comissoesPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Comissões Pendentes
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                R$ {comissoesPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pedido</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Valor do Pedido</TableCell>
              <TableCell align="right">Percentual</TableCell>
              <TableCell align="right">Valor Comissão</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Carregando...</TableCell>
              </TableRow>
            ) : comissoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Nenhuma comissão encontrada.</TableCell>
              </TableRow>
            ) : (
              comissoes.map((pedido) => (
                <TableRow key={pedido._id}>
                  <TableCell>{pedido.numero || pedido._id?.slice(-6)}</TableCell>
                  <TableCell>{pedido.cliente?.razaoSocial || pedido.cliente?.nomeFantasia || '-'}</TableCell>
                  <TableCell align="right">R$ {pedido.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">{percentual}%</TableCell>
                  <TableCell align="right">R$ {((pedido.valorTotal || 0) * (percentual || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{pedido.data ? new Date(pedido.data).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        color: pedido.comissaoPaga ? 'success.main' : 'warning.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {pedido.comissaoPaga ? 'Pago' : 'Pendente'}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MinhasComissoes; 