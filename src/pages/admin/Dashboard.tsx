import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';

interface DashboardData {
  faturamentoMensal: Array<{ mes: string; valor: number }>;
  rankingRepresentantes: Array<{ nome: string; vendas: number; meta: number }>;
  pedidosRecentes: Array<{ id: string; cliente: string; valor: number; status: string }>;
  resumo: {
    faturamentoMes: number;
    crescimentoFaturamento: number;
    pedidosPendentes: number;
    pedidosAguardandoAprovacao: number;
    pedidosEntregues: number;
    pedidosAtrasados: number;
  };
}

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    faturamentoMensal: [],
    rankingRepresentantes: [],
    pedidosRecentes: [],
    resumo: {
      faturamentoMes: 0,
      crescimentoFaturamento: 0,
      pedidosPendentes: 0,
      pedidosAguardandoAprovacao: 0,
      pedidosEntregues: 0,
      pedidosAtrasados: 0
    }
  });
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/pedidos/dashboard');
        const data = response.data.data;
        setDashboardData({
          faturamentoMensal: data.faturamentoMensal || [],
          rankingRepresentantes: data.rankingRepresentantes || [],
          pedidosRecentes: data.pedidosRecentes || [],
          resumo: data.resumo || {
            faturamentoMes: 0,
            crescimentoFaturamento: 0,
            pedidosPendentes: 0,
            pedidosAguardandoAprovacao: 0,
            pedidosEntregues: 0,
            pedidosAtrasados: 0
          }
        });
        setError(null);
      } catch (error) {
        console.error('Dashboard - Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [user]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo
      </Typography>

      {/* Cards de Métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Faturamento Mensal</Typography>
              </Box>
              <Typography variant="h4">
                {formatarMoeda(dashboardData.resumo.faturamentoMes)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.resumo.crescimentoFaturamento > 0 ? '+' : ''}
                {dashboardData.resumo.crescimentoFaturamento}% em relação ao mês anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Pedidos Pendentes</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.resumo.pedidosPendentes}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.resumo.pedidosAguardandoAprovacao} aguardando aprovação
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShippingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Pedidos Entregues</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.resumo.pedidosEntregues}</Typography>
              <Typography variant="body2" color="text.secondary">
                Este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pedidos Atrasados</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.resumo.pedidosAtrasados}</Typography>
              <Typography variant="body2" color="text.secondary">
                Necessitam atenção
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de Faturamento */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Faturamento por Mês
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                  <Legend />
                  <Bar dataKey="valor" name="Faturamento" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Ranking de Representantes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ranking de Representantes
            </Typography>
            <List>
              {dashboardData.rankingRepresentantes.map((rep, index) => (
                <React.Fragment key={rep.nome}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1 }} />
                          <Typography variant="body1">{rep.nome}</Typography>
                        </Box>
                      }
                      secondary={
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <Typography variant="body2" component="span">
                              {formatarMoeda(rep.vendas)}
                            </Typography>
                            <Typography variant="body2" component="span">
                              Meta: {formatarMoeda(rep.meta)}
                            </Typography>
                          </div>
                          <LinearProgress
                            variant="determinate"
                            value={(rep.vendas / rep.meta) * 100}
                            sx={{ mt: 1 }}
                          />
                        </div>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.rankingRepresentantes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Tabela de Pedidos Recentes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos Recentes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.pedidosRecentes.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.id}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell align="right">{formatarMoeda(pedido.valor)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 
                              pedido.status === 'Entregue'
                                ? 'success.main'
                                : pedido.status === 'Pendente'
                                ? 'warning.main'
                                : 'info.main',
                          }}
                        >
                          {pedido.status}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 