import React, { useEffect, useState } from 'react';
import { 
  Button,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Link as LinkIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { representanteService } from '../../services/representanteService';
import { format } from 'date-fns';

interface Representante {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  status: string;
  comissao?: number;
}

const ListaRepresentantes: React.FC = () => {
  const navigate = useNavigate();
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [representanteSelecionado, setRepresentanteSelecionado] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openHistorico, setOpenHistorico] = useState(false);
  const [repHistorico, setRepHistorico] = useState<Representante | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalComissao, setTotalComissao] = useState(0);

  const carregarRepresentantes = async () => {
    try {
      setLoading(true);
      const data = await representanteService.listar();
      console.log('Representantes carregados do backend:', data);
      setRepresentantes(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar representantes:', err);
      setError('Erro ao carregar a lista de representantes. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRepresentantes();
  }, []);

  useEffect(() => {
    if (openHistorico && repHistorico) {
      setLoadingHistorico(true);
      representanteService.historicoVendas(repHistorico.id)
        .then(pedidos => {
          const pedidosFaturados = pedidos.filter((p: any) => p.dataFaturamento);
          setHistorico(pedidosFaturados);
          const total = pedidosFaturados.reduce((acc: number, p: any) => acc + (p.valorTotal || 0), 0);
          setTotalVendas(total);
          const comissao = repHistorico.comissao ? Number(repHistorico.comissao) : 0;
          const totalCom = pedidosFaturados.reduce((acc: number, p: any) => acc + ((p.valorTotal || 0) * comissao / 100), 0);
          setTotalComissao(totalCom);
        })
        .finally(() => setLoadingHistorico(false));
    } else {
      setHistorico([]);
      setTotalVendas(0);
      setTotalComissao(0);
    }
  }, [openHistorico, repHistorico]);

  const handleDelete = async () => {
    if (!representanteSelecionado) return;

    try {
      await representanteService.excluir(representanteSelecionado);
      setSnackbar({
        open: true,
        message: 'Representante excluído com sucesso',
        severity: 'success'
      });
      carregarRepresentantes();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir representante',
        severity: 'error'
      });
    } finally {
      setDeleteDialog(false);
      setRepresentanteSelecionado(null);
    }
  };

  const handleStatusChange = async (id: string, statusAtual: string) => {
    try {
      await representanteService.alterarStatus(id, statusAtual.toLowerCase() !== 'ativo');
      carregarRepresentantes();
      setSnackbar({
        open: true,
        message: 'Status alterado com sucesso',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao alterar status',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Representantes</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/representantes/novo')}
        >
          Novo Representante
        </Button>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Região</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {representantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    Nenhum representante cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              representantes.map((representante) => (
                <TableRow key={representante.id}>
                  <TableCell>{representante.nome}</TableCell>
                  <TableCell>{representante.email}</TableCell>
                  <TableCell>{representante.telefone}</TableCell>
                  <TableCell>{representante.regiao}</TableCell>
                  <TableCell>
                    <Chip 
                      label={representante.status}
                      color={representante.status.toLowerCase() === 'ativo' ? 'success' : 'error'}
                      size="small"
                      onClick={() => handleStatusChange(representante.id, representante.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/admin/representantes/${representante.id}/editar`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="info"
                      onClick={() => {
                        console.log('Representante no clique:', representante);
                        if (!representante.id) {
                          alert('ID do representante não encontrado!');
                          return;
                        }
                        navigate(`/admin/representantes/${representante.id}/carteira-clientes`);
                      }}
                    >
                      <LinkIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary"
                      onClick={() => {
                        setRepHistorico(representante);
                        setOpenHistorico(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => {
                        setRepresentanteSelecionado(representante.id);
                        setDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este representante?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de histórico de vendas/comissão */}
      <Dialog open={openHistorico} onClose={() => setOpenHistorico(false)} maxWidth="md" fullWidth>
        <DialogTitle>Histórico de Vendas e Comissão</DialogTitle>
        <DialogContent>
          {repHistorico && (
            <>
              <Typography variant="h6">{repHistorico.nome} ({repHistorico.email})</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>Comissão: {Number(repHistorico.comissao) || 0}%</Typography>
            </>
          )}
          <Box sx={{ mt: 2 }}>
            {loadingHistorico ? (
              <Typography variant="body2">Carregando vendas...</Typography>
            ) : (
              historico.length === 0 ? (
                <Typography variant="body2">Nenhuma venda encontrada.</Typography>
              ) : (
                <>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Data Faturamento</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Comissão</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historico.map((pedido) => (
                        <TableRow key={pedido._id}>
                          <TableCell>{pedido.data ? format(new Date(pedido.data), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>{pedido.dataFaturamento ? format(new Date(pedido.dataFaturamento), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>{pedido.cliente?.razaoSocial || pedido.cliente?.nomeFantasia || '-'}</TableCell>
                          <TableCell>{pedido.status}</TableCell>
                          <TableCell>R$ {pedido.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            R$ {((pedido.valorTotal || 0) * (Number(repHistorico?.comissao) || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            {pedido.comissaoPaga ? (
                              <Chip label="Paga" color="success" size="small" sx={{ ml: 1 }} />
                            ) : (
                              <Chip label="A Pagar" color="warning" size="small" sx={{ ml: 1 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Total de Vendas: <b>R$ {historico.filter((p: any) => !p.comissaoPaga).reduce((acc: number, p: any) => acc + (p.valorTotal || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></Typography>
                    <Typography variant="subtitle1">Total Comissão: <b>R$ {historico.filter((p: any) => !p.comissaoPaga).reduce((acc: number, p: any) => acc + ((p.valorTotal || 0) * (Number(repHistorico?.comissao) || 0) / 100), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Total já pago: <b>R$ {historico.filter((p: any) => p.comissaoPaga).reduce((acc: number, p: any) => acc + ((p.valorTotal || 0) * (Number(repHistorico?.comissao) || 0) / 100), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></Typography>
                </>
              )
            )}
          </Box>
          <Button
            variant="contained"
            color="success"
            sx={{ mb: 2 }}
            disabled={loadingHistorico || historico.length === 0 || historico.every(p => p.comissaoPaga)}
            onClick={async () => {
              if (!repHistorico) return;
              await representanteService.marcarComissoesPagas(repHistorico.id);
              setSnackbar({ open: true, message: 'Comissão paga com sucesso!', severity: 'success' });
              // Recarregar histórico
              setLoadingHistorico(true);
              const pedidos = await representanteService.historicoVendas(repHistorico.id);
              const pedidosFaturados = pedidos.filter((p: any) => p.dataFaturamento);
              setHistorico(pedidosFaturados);
              const total = pedidosFaturados.reduce((acc: number, p: any) => acc + (p.valorTotal || 0), 0);
              setTotalVendas(total);
              const comissao = repHistorico.comissao ? Number(repHistorico.comissao) : 0;
              const totalCom = pedidosFaturados.reduce((acc: number, p: any) => acc + ((p.valorTotal || 0) * comissao / 100), 0);
              setTotalComissao(totalCom);
              setLoadingHistorico(false);
            }}
          >
            Pagar comissão
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistorico(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ListaRepresentantes; 