import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { formatarMoeda } from '../../utils/format';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PedidoPDF from '../../components/PedidoPDF';
import { useNavigate } from 'react-router-dom';
import { pedidoService, Pedido as PedidoAPI } from '../../services/pedidoService';
import { useSnackbar } from 'notistack';

// Tipos de status possíveis para um pedido
type StatusPedido = 
  | 'Em Separação'
  | 'Faturado'
  | 'Enviado'
  | 'Aguardando Estoque';

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: string;
  cliente: {
    nome: string;
    cnpj: string;
    endereco: string;
  };
  produtos: Produto[];
  status: StatusPedido;
  valorTotal: number;
  dataPedido: string;
  dataPrevisao: string;
  boleto?: string;
  notaFiscal?: string;
}

const statusColors: Record<StatusPedido, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  'Em Separação': 'primary',
  'Faturado': 'info',
  'Enviado': 'secondary',
  'Aguardando Estoque': 'warning',
};

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoAPI[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoAPI | null>(null);
  const [dialogoStatus, setDialogoStatus] = useState(false);
  const [dialogoDocumentos, setDialogoDocumentos] = useState(false);
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    pedidoService.listar()
      .then((data) => setPedidos(data))
      .catch(() => setError('Erro ao carregar pedidos'))
      .finally(() => setLoading(false));
  }, []);

  const handleMudarStatus = (pedido: PedidoAPI) => {
    setPedidoSelecionado(pedido);
    setNovoStatus(pedido.status || '');
    setDialogoStatus(true);
  };

  const handleSalvarStatus = async () => {
    if (pedidoSelecionado && novoStatus) {
      try {
        await pedidoService.atualizarStatus(pedidoSelecionado.id || pedidoSelecionado._id || '', novoStatus);
        setPedidos(pedidos => pedidos.map(p => (p.id === pedidoSelecionado.id || p._id === pedidoSelecionado._id) ? { ...p, status: novoStatus } : p));
        enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
        setDialogoStatus(false);
      } catch (err) {
        enqueueSnackbar('Erro ao atualizar status do pedido.', { variant: 'error' });
      }
    }
  };

  const handleUploadDocumento = async (event: React.ChangeEvent<HTMLInputElement>, tipo: 'boleto' | 'notaFiscal') => {
    if (!event.target.files || !event.target.files[0] || !pedidoSelecionado) return;

    const arquivo = event.target.files[0];
    // TODO: Implementar upload do arquivo para a API
    console.log(`Upload de ${tipo}:`, arquivo.name);

    // Simulando atualização do pedido com o documento
    setPedidos(pedidos.map(p =>
      p.id === pedidoSelecionado.id
        ? { ...p, [tipo]: arquivo.name }
        : p
    ));
  };

  const gerarPDF = (pedido: PedidoAPI) => {
    return (
      <PDFDownloadLink
        document={
          <PedidoPDF
            numeroPedido={(pedido.id || pedido._id) ?? ''}
            cliente={typeof pedido.cliente === 'string' ? { nome: pedido.cliente, endereco: '', cnpj: '' } : {
              nome: pedido.cliente?.razaoSocial || pedido.cliente?.nomeFantasia || pedido.cliente?.nome || '-',
              endereco: '',
              cnpj: pedido.cliente?.cnpj || ''
            }}
            produtos={pedido.itens?.map(item => ({
              id: typeof item.produto === 'string' ? item.produto : (item.produto && 'id' in item.produto ? item.produto.id : ''),
              nome: typeof item.produto === 'string' ? item.produto : (item.produto && 'nome' in item.produto ? item.produto.nome : '-'),
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              subtotal: item.quantidade * item.valorUnitario,
            })) || []}
            valorTotal={pedido.itens?.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0) || 0}
            dataPedido={pedido.dataCriacao || pedido.data || '-'}
            dataPrevisao={'-'}
          />
        }
        fileName={`pedido-${pedido.id || pedido._id}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <IconButton
            color="primary"
            disabled={loading}
            title="Gerar PDF do Pedido"
          >
            <ReceiptIcon />
          </IconButton>
        )}
      </PDFDownloadLink>
    );
  };

  const abrirDialogoDocumentos = (pedido: PedidoAPI) => {
    setPedidoSelecionado(pedido);
    setDialogoDocumentos(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Pedidos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pedido</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Previsão</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Carregando...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={7} style={{ color: 'red' }}>{error}</TableCell></TableRow>
            ) : pedidos.length === 0 ? (
              <TableRow><TableCell colSpan={7}>Nenhum pedido encontrado.</TableCell></TableRow>
            ) : (
              pedidos.map((pedido: any) => {
                const pedidoId = pedido.id || pedido._id;
                const clienteNome = typeof pedido.cliente === 'string'
                  ? pedido.cliente
                  : pedido.cliente && (pedido.cliente.razaoSocial || pedido.cliente.nomeFantasia || pedido.cliente.nome || 'Sem nome');
                const dataPedido = pedido.dataCriacao || pedido.data || '-';
                const valorTotal = pedido.itens?.reduce((acc: number, item: any) => acc + (item.quantidade * item.valorUnitario), 0) || 0;
                return (
                  <TableRow key={pedidoId}>
                    <TableCell>{pedidoId?.slice ? pedidoId.slice(-6).toUpperCase() : pedidoId}</TableCell>
                    <TableCell>{clienteNome}</TableCell>
                    <TableCell>{dataPedido !== '-' ? new Date(dataPedido).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell align="right">{formatarMoeda(valorTotal)}</TableCell>
                    <TableCell>
                      <Chip label={pedido.status} color={statusColors[pedido.status as StatusPedido] || 'default'} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="primary" title="Ver detalhes" onClick={() => navigate(`/admin/pedidos/${pedidoId}`)}>
                          <ViewIcon />
                        </IconButton>
                        {gerarPDF(pedido)}
                        <IconButton
                          color="info"
                          onClick={() => abrirDialogoDocumentos(pedido)}
                          title="Gerenciar Documentos"
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Mudança de Status */}
      <Dialog open={dialogoStatus} onClose={() => setDialogoStatus(false)}>
        <DialogTitle>Alterar Status do Pedido</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={novoStatus}
              label="Status"
              onChange={e => setNovoStatus(e.target.value)}
            >
              <MenuItem value="Em Separação">Em Separação</MenuItem>
              <MenuItem value="Faturado">Faturado</MenuItem>
              <MenuItem value="Enviado">Enviado</MenuItem>
              <MenuItem value="Aguardando Estoque">Aguardando Estoque</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoStatus(false)}>Cancelar</Button>
          <Button onClick={handleSalvarStatus} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Documentos */}
      <Dialog
        open={dialogoDocumentos}
        onClose={() => setDialogoDocumentos(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Documentos do Pedido</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Boleto
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {pedidoSelecionado?.boleto ? (
                    <>
                      <Typography>{pedidoSelecionado.boleto}</Typography>
                      <IconButton color="primary" size="small">
                        <ReceiptIcon />
                      </IconButton>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Nenhum boleto anexado
                    </Typography>
                  )}
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Boleto
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleUploadDocumento(e, 'boleto')}
                  />
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Nota Fiscal
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {pedidoSelecionado?.notaFiscal ? (
                    <>
                      <Typography>{pedidoSelecionado.notaFiscal}</Typography>
                      <IconButton color="primary" size="small">
                        <ReceiptIcon />
                      </IconButton>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Nenhuma nota fiscal anexada
                    </Typography>
                  )}
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Nota Fiscal
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleUploadDocumento(e, 'notaFiscal')}
                  />
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoDocumentos(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaPedidos; 