import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { pedidoService, Pedido } from '../../services/pedidoService';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { produtoService } from '../../services/produtoService';
import { Produto } from '../../types/produto';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';

const statusOptions = [
  'Em Separação',
  'Faturado',
  'Enviado',
  'Aguardando Estoque',
  'Finalizado',
];

const statusColors: Record<string, any> = {
  'Em Separação': 'primary',
  'Faturado': 'info',
  'Enviado': 'secondary',
  'Aguardando Estoque': 'warning',
  'Finalizado': 'success',
};

const statusFlow = [
  'Em Separação',
  'Faturado',
  'Enviado',
  'Aguardando Estoque',
  'Finalizado',
];

interface PedidoComHistorico extends Pedido {
  historicoAlteracoes?: any[];
  status?: string;
}

const DetalhesPedido: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoComHistorico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [editando, setEditando] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      pedidoService.obter(id)
        .then((p) => {
          console.log('[DetalhesPedido] Pedido carregado:', p);
          setPedido({ ...p, status: p.status || 'Em Separação' });
          setNovoStatus(p.status || 'Em Separação');
          setPedidoEdit({ ...p });
        })
        .catch((err) => {
          console.error('[DetalhesPedido] Erro ao carregar pedido:', err);
          setError('Erro ao carregar pedido');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    produtoService.listar().then(setProdutos);
  }, []);

  useEffect(() => {
    if (editando && pedidoEdit) {
      setPedidoEdit((prev: any) => recalcularValores(prev));
    }
    // eslint-disable-next-line
  }, [editando, pedidoEdit?.condicaoPagamento]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error || !pedido) {
    return <Typography color="error">{error || 'Pedido não encontrado.'}</Typography>;
  }

  const clienteNome = typeof pedido.cliente === 'string'
    ? pedido.cliente
    : pedido.cliente && (pedido.cliente.razaoSocial || pedido.cliente.nomeFantasia || pedido.cliente.nome || 'Sem nome');

  const statusValidos = statusOptions;
  let statusValue = editando ? (pedidoEdit?.status || statusOptions[0]) : (novoStatus || pedido.status || statusOptions[0]);
  if (!statusValidos.includes(statusValue)) {
    statusValue = statusOptions[0];
  }
  const condicaoPagamentoValue = editando ? (pedidoEdit?.condicaoPagamento || 'avista') : (pedido.condicaoPagamento || 'avista');

  const salvarStatus = async () => {
    if (!pedido) return;
    const pedidoId = (pedido.id || pedido._id) ?? '';
    try {
      await pedidoService.atualizarStatus(pedidoId, novoStatus);
      setPedido({ ...pedido, status: novoStatus });
      enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Erro ao atualizar status.', { variant: 'error' });
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setPedidoEdit((prev: any) => ({ ...prev, [field]: value }));
  };

  const prepararPedidoParaEnvio = (pedido: any) => {
    let status = pedido.status;
    if (!statusValidos.includes(status)) {
      status = statusOptions[0];
    }
    let clienteId = '';
    if (typeof pedido.cliente === 'object') {
      clienteId = pedido.cliente._id || pedido.cliente.id || '';
    } else {
      clienteId = pedido.cliente;
    }
    let representanteId = '';
    if (typeof pedido.representante === 'object') {
      representanteId = pedido.representante._id || pedido.representante.id || '';
    } else {
      representanteId = pedido.representante;
    }
    const itens = (pedido.itens || []).map((item: any) => {
      let produtoId = '';
      if (typeof item.produto === 'object') {
        produtoId = item.produto._id || item.produto.id || '';
      } else {
        produtoId = item.produto;
      }
      return {
        produto: produtoId,
        quantidade: Number(item.quantidade) || 1,
        valorUnitario: Number(item.valorUnitario) || 0,
        valorTotal: Number(item.valorTotal) || 0,
      };
    });
    const pedidoLimpo: any = {
      cliente: clienteId,
      representante: representanteId,
      status,
      condicaoPagamento: pedido.condicaoPagamento,
      detalhePrazo: pedido.detalhePrazo || '',
      itens,
      valorTotal: Number(pedido.valorTotal) || 0,
    };
    if (pedido.dataCriacao) pedidoLimpo.dataCriacao = pedido.dataCriacao;
    if (pedido.data) pedidoLimpo.data = pedido.data;
    return pedidoLimpo;
  };

  const salvarEdicao = async () => {
    if (!pedido || !pedidoEdit) return;
    const pedidoId = (pedido.id || pedido._id) ?? '';
    try {
      const pedidoParaEnvio = prepararPedidoParaEnvio(pedidoEdit);
      console.log('[salvarEdicao] Payload enviado:', pedidoParaEnvio);
      await pedidoService.editar(pedidoId, pedidoParaEnvio, 'Edição manual pelo administrador');
      setPedido({ ...pedidoEdit });
      setEditando(false);
      enqueueSnackbar('Pedido editado com sucesso!', { variant: 'success' });
    } catch (err: any) {
      let msg = 'Erro ao editar pedido.';
      if (err?.response?.data?.error?.message) {
        msg += ' ' + err.response.data.error.message;
      } else if (err?.response?.data?.message) {
        msg += ' ' + err.response.data.message;
      }
      enqueueSnackbar(msg, { variant: 'error' });
      console.error('[salvarEdicao] Erro:', err);
    }
  };

  const adicionarProduto = () => {
    if (!produtoSelecionado || !editando) return;
    const jaExiste = pedidoEdit.itens.some((item: any) => item.produto === produtoSelecionado._id || item.produto === produtoSelecionado.id);
    if (jaExiste) return;
    const precoAVista = typeof produtoSelecionado.precoAVista === 'number' ? produtoSelecionado.precoAVista : 0;
    const precoAPrazo = typeof produtoSelecionado.precoAPrazo === 'number' ? produtoSelecionado.precoAPrazo : 0;
    const valorUnitario = pedidoEdit.condicaoPagamento === 'avista' ? precoAVista : precoAPrazo;
    const novoItem = {
      produto: produtoSelecionado._id || produtoSelecionado.id,
      quantidade: 1,
      valorUnitario,
      valorTotal: valorUnitario,
      pesoPorMetro: produtoSelecionado.pesoPorMetro || 0,
    };
    setPedidoEdit((prev: any) => ({ ...prev, itens: [...prev.itens, novoItem] }));
    setProdutoSelecionado(null);
  };

  const removerProduto = (idx: number) => {
    setPedidoEdit((prev: any) => ({ ...prev, itens: prev.itens.filter((_: any, i: number) => i !== idx) }));
  };

  const recalcularValores = (novoEdit: any) => {
    let valorTotalPedido = 0;
    let pesoTotalPedido = 0;
    const itensAtualizados = novoEdit.itens.map((item: any) => {
      const produto = produtos.find(p => p._id === item.produto || p.id === item.produto || p.nome === item.produto);
      if (!produto) return { ...item, valorUnitario: 0, valorTotal: 0 };
      const precoAVista = typeof produto.precoAVista === 'number' ? produto.precoAVista : 0;
      const precoAPrazo = typeof produto.precoAPrazo === 'number' ? produto.precoAPrazo : 0;
      const valorUnitario = novoEdit.condicaoPagamento === 'avista' ? precoAVista : precoAPrazo;
      const valorTotal = valorUnitario * item.quantidade;
      const pesoItem = (produto.pesoPorMetro || 0) * item.quantidade;
      valorTotalPedido += valorTotal;
      pesoTotalPedido += pesoItem;
      return { ...item, valorUnitario, valorTotal };
    });
    return { ...novoEdit, itens: itensAtualizados, valorTotal: valorTotalPedido, pesoTotal: pesoTotalPedido };
  };

  const historicoAlteracoes = pedido.historicoAlteracoes || [];

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Voltar</Button>
      <Typography variant="h5" gutterBottom>Detalhes do Pedido</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">Pedido:</Typography>
          <Typography>{pedido.id || pedido._id}</Typography>
          <Chip label={pedido.status || 'Em Separação'} color={statusColors[pedido.status as keyof typeof statusColors] || 'default'} />
        </Stack>
        <Box sx={{ mt: 2, mb: 2 }}>
          <FormControl fullWidth sx={{ maxWidth: 300 }}>
            <InputLabel>Status do Pedido</InputLabel>
            <Select
              value={statusValue}
              label="Status do Pedido"
              onChange={e => editando ? handleEditChange('status', e.target.value) : setNovoStatus(e.target.value)}
              disabled={!editando}
            >
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!editando && <Button variant="contained" sx={{ ml: 2, mt: 1 }} onClick={salvarStatus} disabled={novoStatus === pedido.status}>Salvar Status</Button>}
          {editando && <Button variant="contained" sx={{ ml: 2, mt: 1 }} onClick={salvarEdicao}>Salvar Edição</Button>}
          {!editando && <Button variant="outlined" sx={{ ml: 2, mt: 1 }} onClick={() => setEditando(true)}>Editar Pedido</Button>}
          {editando && <Button variant="outlined" sx={{ ml: 2, mt: 1 }} onClick={() => { setEditando(false); setPedidoEdit({ ...pedido }); }}>Cancelar</Button>}
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Cliente: {clienteNome}</Typography>
        <Typography variant="subtitle2">Data: {pedido.dataCriacao ? format(new Date(pedido.dataCriacao), 'dd/MM/yyyy') : (pedido.data ? format(new Date(pedido.data), 'dd/MM/yyyy') : '-')}</Typography>
        <Typography variant="subtitle2">Valor Total: {pedido.itens?.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Paper>
      {editando && (
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            options={produtos}
            getOptionLabel={(option) => option.nome}
            value={produtoSelecionado}
            onChange={(_, value) => setProdutoSelecionado(value)}
            renderInput={(params) => <TextField {...params} label="Adicionar Produto" variant="outlined" />}
            sx={{ width: 300, display: 'inline-block', mr: 2 }}
          />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={adicionarProduto} disabled={!produtoSelecionado}>Adicionar</Button>
        </Box>
      )}
      <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor Unitário</TableCell>
              <TableCell>Subtotal</TableCell>
              {editando && <TableCell>Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {(editando ? pedidoEdit?.itens : pedido.itens || []).map((item: any, idx: number) => {
              let produtoNome = '-';
              let produtoObj: Produto | undefined = undefined;
              if (typeof item.produto === 'string') {
                produtoObj = produtos.find(p => p._id === item.produto || p.id === item.produto || p.nome === item.produto);
                produtoNome = produtoObj?.nome || item.produto;
              } else if (item.produto && typeof item.produto === 'object' && 'nome' in item.produto) {
                produtoNome = (item.produto as any).nome || '-';
              }
              return (
                <TableRow key={idx}>
                  <TableCell>{produtoNome}</TableCell>
                  <TableCell>{editando ? <TextField type="number" value={item.quantidade} onChange={e => {
                    const val = Number(e.target.value);
                    setPedidoEdit((prev: any) => {
                      const novos = [...prev.itens];
                      novos[idx].quantidade = val;
                      return recalcularValores({ ...prev, itens: novos });
                    });
                  }} /> : item.quantidade}</TableCell>
                  <TableCell>{item.valorUnitario?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell>{(item.quantidade * item.valorUnitario)?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  {editando && <TableCell><Button color="error" onClick={() => removerProduto(idx)}><DeleteIcon /></Button></TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {editando && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth sx={{ maxWidth: 300, mr: 2 }}>
            <InputLabel>Condição de Pagamento</InputLabel>
            <Select
              value={condicaoPagamentoValue}
              label="Condição de Pagamento"
              onChange={e => setPedidoEdit((prev: any) => recalcularValores({ ...prev, condicaoPagamento: e.target.value }))}
            >
              <MenuItem value="avista">À vista</MenuItem>
              <MenuItem value="aprazo">A prazo</MenuItem>
            </Select>
          </FormControl>
          {condicaoPagamentoValue === 'aprazo' && (
            <TextField
              label="Detalhe do Prazo"
              value={pedidoEdit?.detalhePrazo || ''}
              onChange={e => setPedidoEdit((prev: any) => ({ ...prev, detalhePrazo: e.target.value }))}
              sx={{ maxWidth: 300 }}
            />
          )}
        </Box>
      )}
      {/* Histórico de alterações */}
      {historicoAlteracoes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Histórico de Alterações</Typography>
          {historicoAlteracoes.map((alt: any, idx: number) => (
            <Paper key={idx} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2">Data: {format(new Date(alt.data), 'dd/MM/yyyy HH:mm')}</Typography>
              <Typography variant="subtitle2">Usuário: {alt.usuario?.nome} ({alt.usuario?.email})</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Descrição: {alt.descricao || 'Alteração manual'}</Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>Resumo da alteração:</Typography>
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(alt.pedidoAlterado, null, 2)}</pre>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DetalhesPedido; 