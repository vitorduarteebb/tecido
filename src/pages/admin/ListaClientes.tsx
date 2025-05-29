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
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import { Cliente } from '../../types';

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  confirmAction: () => void;
}

const ListaClientes: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: '',
    message: '',
    confirmAction: () => {}
  });

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.listar();
      setClientes(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar a lista de clientes');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    setDialog({
      open: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      confirmAction: async () => {
        try {
          await clienteService.excluir(id);
          await carregarClientes();
          setDeleteError('');
        } catch (err) {
          setDeleteError('Erro ao excluir o cliente');
          console.error('Erro ao excluir cliente:', err);
        }
        setDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleToggleStatus = async (cliente: Cliente) => {
    if (!cliente.id) return;

    const novoStatus = cliente.status === 'ativo' ? 'inativo' : 'ativo';
    const mensagem = `Tem certeza que deseja ${novoStatus === 'ativo' ? 'ativar' : 'desativar'} este cliente?`;

    setDialog({
      open: true,
      title: `Confirmar ${novoStatus === 'ativo' ? 'Ativação' : 'Desativação'}`,
      message: mensagem,
      confirmAction: async () => {
        try {
          await clienteService.alterarStatus(cliente.id!, novoStatus === 'ativo');
          await carregarClientes();
        } catch (err) {
          setError(`Erro ao ${novoStatus === 'ativo' ? 'ativar' : 'desativar'} o cliente`);
          console.error('Erro ao alterar status do cliente:', err);
        }
        setDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/clientes/novo')}
          className="bg-blue-500"
        >
          Novo Cliente
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Razão Social</TableCell>
              <TableCell>Nome Fantasia</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center" width="250">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow 
                key={cliente.id}
                sx={{ 
                  backgroundColor: cliente.status === 'inativo' ? '#f5f5f5' : 'inherit',
                  '&:hover': { backgroundColor: cliente.status === 'inativo' ? '#eeeeee' : '#f5f5f5' }
                }}
              >
                <TableCell>{cliente.razaoSocial}</TableCell>
                <TableCell>{cliente.nomeFantasia}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
                <TableCell>
                  <Chip
                    label={cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={cliente.status === 'ativo' ? 'success' : 'error'}
                    size="small"
                    icon={cliente.status === 'ativo' ? <CheckCircleIcon /> : <BlockIcon />}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Tooltip title="Visualizar detalhes">
                      <span>
                        <IconButton 
                          size="small"
                          color="info"
                          onClick={() => cliente.id && navigate(`/admin/clientes/${cliente.id}`)}
                          disabled={!cliente.id}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Editar cliente">
                      <span>
                        <IconButton 
                          size="small"
                          color="primary" 
                          onClick={() => cliente.id && navigate(`/admin/clientes/${cliente.id}/editar`)}
                          disabled={!cliente.id}
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Histórico de pedidos">
                      <span>
                        <IconButton 
                          size="small"
                          color="secondary"
                          onClick={() => cliente.id && navigate(`/admin/clientes/${cliente.id}/pedidos`)}
                          disabled={!cliente.id}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title={cliente.status === 'ativo' ? 'Desativar cliente' : 'Ativar cliente'}>
                      <span>
                        <IconButton 
                          size="small"
                          color={cliente.status === 'ativo' ? 'warning' : 'success'}
                          onClick={() => cliente.id && handleToggleStatus(cliente)}
                          disabled={!cliente.id}
                        >
                          {cliente.status === 'ativo' ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Excluir cliente">
                      <span>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => cliente.id && handleDelete(cliente.id)}
                          disabled={!cliente.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialog.open}
        onClose={() => setDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{dialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(prev => ({ ...prev, open: false }))} color="inherit">
            Cancelar
          </Button>
          <Button onClick={() => dialog.confirmAction()} color="primary" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={() => setDeleteError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setDeleteError('')} severity="error">
          {deleteError}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ListaClientes; 