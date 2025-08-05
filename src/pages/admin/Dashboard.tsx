import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
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
  useTheme,
  useMediaQuery,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'aprovado':
        return 'info';
      case 'entregue':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const isPedidoNovo = (pedido: any) => {
    if (!pedido.data) return false;
    const dataPedido = new Date(pedido.data);
    const agora = new Date();
    const diffHoras = (agora.getTime() - dataPedido.getTime()) / (1000 * 60 * 60);
    return diffHoras <= 2;
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Carregando dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        sx={{ 
          mb: 3,
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        Painel Administrativo
      </Typography>

      {/* Cards de Métricas */}
      <Grid container spacing={isSmallMobile ? 1 : 2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                <Typography variant={isSmallMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  Faturamento Mensal
                </Typography>
              </Box>
              <Typography variant={isSmallMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
                {formatarMoeda(dashboardData.resumo.faturamentoMes)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {dashboardData.resumo.crescimentoFaturamento > 0 ? '+' : ''}
                {dashboardData.resumo.crescimentoFaturamento}% em relação ao mês anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                <Typography variant={isSmallMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  Pedidos Pendentes
                </Typography>
              </Box>
              <Typography variant={isSmallMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.resumo.pedidosPendentes}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {dashboardData.resumo.pedidosAguardandoAprovacao} aguardando aprovação
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShippingIcon sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                <Typography variant={isSmallMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  Pedidos Entregues
                </Typography>
              </Box>
              <Typography variant={isSmallMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.resumo.pedidosEntregues}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                <Typography variant={isSmallMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  Pedidos Atrasados
                </Typography>
              </Box>
              <Typography variant={isSmallMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.resumo.pedidosAtrasados}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Necessitam atenção
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico e Tabelas */}
      <Grid container spacing={isSmallMobile ? 1 : 2}>
        {/* Gráfico de Faturamento */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Faturamento Mensal
              </Typography>
              <Box sx={{ height: isMobile ? 250 : 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.faturamentoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      fontSize={isSmallMobile ? 10 : 12}
                    />
                    <YAxis 
                      fontSize={isSmallMobile ? 10 : 12}
                      tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatarMoeda(value), 'Faturamento']}
                      labelStyle={{ fontSize: isSmallMobile ? 12 : 14 }}
                    />
                    <Legend />
                    <Bar dataKey="valor" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ranking de Representantes */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Ranking de Representantes
              </Typography>
              <List sx={{ mt: 1 }}>
                {dashboardData.rankingRepresentantes.slice(0, 5).map((rep, index) => (
                  <React.Fragment key={rep.nome}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {index + 1}. {rep.nome}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                              {formatarMoeda(rep.vendas)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(rep.vendas / rep.meta) * 100}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Meta: {formatarMoeda(rep.meta)} ({Math.round((rep.vendas / rep.meta) * 100)}%)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.rankingRepresentantes.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Pedidos Recentes */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Pedidos Recentes
              </Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table size={isSmallMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.pedidosRecentes.map((pedido) => (
                      <TableRow key={pedido.id} hover>
                        <TableCell sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          #{pedido.id.slice(-6)}
                          {isPedidoNovo(pedido) && (
                            <Chip label="Novo" color="success" size="small" sx={{ ml: 1, fontWeight: 700, fontSize: '0.7rem' }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>
                          {pedido.cliente}
                        </TableCell>
                        <TableCell sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>
                          {formatarMoeda(pedido.valor)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pedido.status}
                            color={getStatusColor(pedido.status) as any}
                            size={isSmallMobile ? "small" : "medium"}
                            sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalhes">
                            <IconButton size={isSmallMobile ? "small" : "medium"}>
                              <VisibilityIcon fontSize={isSmallMobile ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 