import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { representanteService } from '../../services/representanteService';
import { clienteService } from '../../services/clienteService';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, Checkbox, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Cliente } from '../../types';

export default function CarteiraClientesRepresentante() {
  const { id } = useParams<{ id: string }>();
  console.log('ID do representante:', id);
  const navigate = useNavigate();
  const [representante, setRepresentante] = useState<any>(null);
  const [clientesVinculados, setClientesVinculados] = useState<Cliente[]>([]);
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([]);
  const [selectedToVincular, setSelectedToVincular] = useState<string[]>([]);
  const [selectedToDesvincular, setSelectedToDesvincular] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (id) {
      representanteService.obter(id).then(setRepresentante);
      representanteService.listarClientes(id).then(setClientesVinculados);
      clienteService.listar().then(setTodosClientes);
    }
  }, [id]);

  const handleVincular = async () => {
    if (!id || selectedToVincular.length === 0) return;
    try {
      await representanteService.vincularClientes(id, selectedToVincular);
      setSnackbar({open: true, message: 'Clientes vinculados com sucesso!', severity: 'success'});
      setSelectedToVincular([]);
      const atualizados = await representanteService.listarClientes(id);
      setClientesVinculados(atualizados);
    } catch {
      setSnackbar({open: true, message: 'Erro ao vincular clientes.', severity: 'error'});
    }
  };

  const handleDesvincular = async () => {
    if (!id || selectedToDesvincular.length === 0) return;
    try {
      await Promise.all(selectedToDesvincular.map(cid => representanteService.desvincularCliente(id, cid)));
      setSnackbar({open: true, message: 'Clientes desvinculados com sucesso!', severity: 'success'});
      setSelectedToDesvincular([]);
      const atualizados = await representanteService.listarClientes(id);
      setClientesVinculados(atualizados);
    } catch {
      setSnackbar({open: true, message: 'Erro ao desvincular clientes.', severity: 'error'});
    }
  };

  const clientesVinculadosComId = clientesVinculados.map(c => ({ ...c, id: String(c.id) }));
  const todosClientesComId = todosClientes.map(c => ({ ...c, id: String(c.id) }));
  const clientesDisponiveis = todosClientesComId.filter(c => !clientesVinculadosComId.some(v => v.id === c.id) && (c.razaoSocial.toLowerCase().includes(filtro.toLowerCase()) || c.nomeFantasia.toLowerCase().includes(filtro.toLowerCase())));

  if (!id) {
    return <Alert severity="error">Representante não encontrado na URL. (id ausente)</Alert>;
  }

  return (
    <Box p={2}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Voltar</Button>
      <Typography variant="h5" gutterBottom>Carteira de Clientes do Representante</Typography>
      {representante && (
        <Typography variant="subtitle1" gutterBottom>
          <b>{representante.nome}</b> | {representante.email} | {representante.regiao}
        </Typography>
      )}
      <Box mt={3}>
        <Typography variant="h6">Clientes Vinculados</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Razão Social</TableCell>
                <TableCell>Nome Fantasia</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesVinculadosComId.length === 0 ? (
                <TableRow><TableCell colSpan={6}>Nenhum cliente vinculado.</TableCell></TableRow>
              ) : clientesVinculadosComId.map(cliente => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Checkbox checked={selectedToDesvincular.includes(cliente.id)} onChange={e => {
                      setSelectedToDesvincular(e.target.checked ? [...selectedToDesvincular, cliente.id] : selectedToDesvincular.filter(id => id !== cliente.id));
                    }} />
                  </TableCell>
                  <TableCell>{cliente.razaoSocial}</TableCell>
                  <TableCell>{cliente.nomeFantasia}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{cliente.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="outlined" color="error" startIcon={<LinkOffIcon />} disabled={selectedToDesvincular.length === 0} onClick={handleDesvincular} sx={{ mb: 4 }}>
          Desvincular Selecionados
        </Button>
      </Box>
      <Box mt={3}>
        <Typography variant="h6">Vincular Novos Clientes</Typography>
        <TextField label="Buscar cliente" value={filtro} onChange={e => setFiltro(e.target.value)} size="small" sx={{ mb: 2, width: 300 }} />
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Razão Social</TableCell>
                <TableCell>Nome Fantasia</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesDisponiveis.length === 0 ? (
                <TableRow><TableCell colSpan={6}>Nenhum cliente disponível.</TableCell></TableRow>
              ) : clientesDisponiveis.map(cliente => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Checkbox checked={selectedToVincular.includes(cliente.id)} onChange={e => {
                      setSelectedToVincular(e.target.checked ? [...selectedToVincular, cliente.id] : selectedToVincular.filter(id => id !== cliente.id));
                    }} />
                  </TableCell>
                  <TableCell>{cliente.razaoSocial}</TableCell>
                  <TableCell>{cliente.nomeFantasia}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{cliente.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" color="primary" startIcon={<LinkIcon />} disabled={selectedToVincular.length === 0} onClick={handleVincular} sx={{ mt: 2 }}>
          Vincular Selecionados
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 