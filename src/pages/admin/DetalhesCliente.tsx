import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Box,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { clienteService } from '../../services/clienteService';
import { Cliente } from '../../types';
import api from '../../services/api';

const DetalhesCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});

  useEffect(() => {
    const carregarCliente = async () => {
      if (!id) {
        setError('ID do cliente não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await clienteService.obterPorId(id);
        if (!data) {
          setError('Cliente não encontrado');
          return;
        }
        setCliente(data);
        setError('');
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Erro ao carregar os dados do cliente. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    carregarCliente();
  }, [id]);

  const formatarCNPJ = (cnpj?: string) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return '';
    return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  };

  const formatarCEP = (cep?: string) => {
    if (!cep) return '';
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  const formatarMoeda = (valor?: number) => {
    if (valor === undefined) return '';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleResetSenha = async () => {
    const novaSenha = prompt('Digite a nova senha para este cliente (mínimo 6 caracteres):');
    if (!novaSenha || novaSenha.length < 6) {
      setSnackbar({open: true, message: 'A senha deve ter pelo menos 6 caracteres.', severity: 'error'});
      return;
    }
    try {
      await api.patch(`/clientes/${id}/reset-senha`, { novaSenha });
      setSnackbar({open: true, message: 'Senha resetada com sucesso!', severity: 'success'});
    } catch (err: any) {
      setSnackbar({open: true, message: err?.response?.data?.message || 'Erro ao resetar senha.', severity: 'error'});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/clientes')}>
              Voltar para Lista
            </Button>
          }
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-4">
        <Alert 
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/clientes')}>
              Voltar para Lista
            </Button>
          }
        >
          Cliente não encontrado
        </Alert>
      </div>
    );
  }

  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/clientes')}
        >
          Voltar para Lista de Clientes
        </Button>
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/admin/clientes/${id}/editar`)}
          >
            Editar Cliente
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(`/admin/clientes/${id}/pedidos`)}
          >
            Ver Histórico de Pedidos
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleResetSenha}
          >
            Resetar Senha
          </Button>
        </div>
      </div>

      <Paper className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              {cliente.razaoSocial}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {cliente.nomeFantasia}
            </Typography>
          </div>
          <Chip
            icon={cliente.status === 'ativo' ? <CheckCircleIcon /> : <BlockIcon />}
            label={cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
            color={cliente.status === 'ativo' ? 'success' : 'error'}
            sx={{ fontSize: '1.1rem', padding: '8px' }}
          />
        </div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box className="space-y-4">
              <div>
                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                  <BusinessIcon /> Informações Fiscais
                </Typography>
                <Typography><strong>CNPJ:</strong> {formatarCNPJ(cliente.cnpj)}</Typography>
                <Typography><strong>Inscrição Estadual:</strong> {cliente.inscricaoEstadual}</Typography>
              </div>

              <div>
                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                  <EmailIcon /> Contato
                </Typography>
                <Typography><strong>Email:</strong> {cliente.email}</Typography>
                <Typography><strong>Telefone:</strong> {formatarTelefone(cliente.telefone)}</Typography>
                <Typography><strong>Celular:</strong> {formatarTelefone(cliente.celular)}</Typography>
              </div>

              <div>
                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                  <LocationOnIcon /> Endereço
                </Typography>
                <Typography>{cliente.endereco?.logradouro}, {cliente.endereco?.numero}</Typography>
                {cliente.endereco?.complemento && (
                  <Typography>{cliente.endereco?.complemento}</Typography>
                )}
                <Typography>
                  {cliente.endereco?.bairro} - {cliente.endereco?.cidade}/{cliente.endereco?.estado}
                </Typography>
                <Typography><strong>CEP:</strong> {formatarCEP(cliente.endereco?.cep)}</Typography>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="space-y-4">
              <div>
                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                  <AttachMoneyIcon /> Informações Financeiras
                </Typography>
                <Typography><strong>Limite de Crédito:</strong> {formatarMoeda(cliente.limiteCredito)}</Typography>
                <Typography><strong>Condição de Pagamento:</strong> {cliente.condicaoPagamento}</Typography>
              </div>

              <div>
                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                  <PaymentIcon /> Representante
                </Typography>
                <Typography>{cliente.representante}</Typography>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{
          style: { backgroundColor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: '#fff' }
        }}
      />
    </div>
  );
};

export default DetalhesCliente; 