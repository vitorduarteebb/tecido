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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Badge,
  Alert,
  Collapse,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { produtoService } from '../../services/produtoService';

const ListaProdutos: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const [modalMov, setModalMov] = useState<{open: boolean, tipo: 'entrada' | 'saida' | null, produtoId: string | null}>({open: false, tipo: null, produtoId: null});
  const [movQuantidade, setMovQuantidade] = useState(0);
  const [movUsuario, setMovUsuario] = useState('admin'); // Pode ser dinâmico
  const [movObs, setMovObs] = useState('');
  const [movLoading, setMovLoading] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const [produtoMovAberto, setProdutoMovAberto] = useState<string | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loadingMovs, setLoadingMovs] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const data = await produtoService.listar();
        setProdutos(data);
      } catch (err) {
        setErro('Erro ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  const handleExcluir = async () => {
    if (!produtoParaExcluir) return;
    try {
      await produtoService.excluir(produtoParaExcluir);
      setProdutos(produtos.filter(p => (p.id || p._id) !== produtoParaExcluir));
      setSnackbar({open: true, message: 'Produto excluído com sucesso!'});
    } catch {
      setSnackbar({open: true, message: 'Erro ao excluir produto.'});
    }
    setProdutoParaExcluir(null);
  };

  const handleAbrirMov = (tipo: 'entrada' | 'saida', produtoId: string) => {
    setModalMov({open: true, tipo, produtoId});
    setMovQuantidade(0);
    setMovObs('');
  };

  const handleRegistrarMov = async () => {
    if (!modalMov.produtoId || !modalMov.tipo) return;
    setMovLoading(true);
    try {
      await produtoService.registrarMovimentacao(modalMov.produtoId, {
        tipo: modalMov.tipo,
        quantidade: movQuantidade,
        usuario: movUsuario,
        observacao: movObs
      });
      setSnackbar({open: true, message: 'Movimentação registrada!'});
      // Atualiza lista
      const data = await produtoService.listar();
      setProdutos(data);
      setModalMov({open: false, tipo: null, produtoId: null});
    } catch {
      setSnackbar({open: true, message: 'Erro ao registrar movimentação.'});
    }
    setMovLoading(false);
  };

  const handleAbrirHistorico = async (produtoId: string) => {
    setProdutoMovAberto(produtoId);
    setLoadingMovs(true);
    try {
      const movs = await produtoService.listarMovimentacoes(produtoId);
      setMovimentacoes(movs);
    } catch {
      setMovimentacoes([]);
    }
    setLoadingMovs(false);
  };

  const produtosFiltrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const estoqueMatch = !filtroEstoqueBaixo || (p.estoque?.quantidade < 10);
    return nomeMatch && estoqueMatch;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/produtos/novo')}
        >
          Novo Produto
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <TextField
          label="Buscar por nome"
          value={filtroNome}
          onChange={e => setFiltroNome(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          size="small"
          style={{ maxWidth: 300 }}
        />
        <Button
          variant={filtroEstoqueBaixo ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => setFiltroEstoqueBaixo(e => !e)}
        >
          Estoque Baixo
        </Button>
      </div>
      {loading ? (
        <div>Carregando...</div>
      ) : erro ? (
        <div className="text-red-500">{erro}</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="right">Estoque</TableCell>
                <TableCell>Imagem</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow key={produto.id || produto._id}>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell align="right">R$ {produto.preco?.valor?.toFixed(2)}</TableCell>
                  <TableCell align="right" style={{ color: produto.estoque?.quantidade < 10 ? 'red' : undefined }}>
                    <Badge color="warning" variant="dot" invisible={produto.estoque?.quantidade >= 10}>
                      {produto.estoque?.quantidade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {produto.imagem && (
                      <img src={produto.imagem} alt={produto.nome} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => navigate(`/admin/produtos/${produto.id || produto._id}/editar`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="success" onClick={() => handleAbrirMov('entrada', produto.id || produto._id)}>
                      +
                    </IconButton>
                    <IconButton color="warning" onClick={() => handleAbrirMov('saida', produto.id || produto._id)}>
                      -
                    </IconButton>
                    <IconButton color="info" onClick={() => handleAbrirHistorico(produto.id || produto._id)}>
                      H
                    </IconButton>
                    <IconButton color="error" onClick={() => setProdutoParaExcluir(produto.id || produto._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={!!produtoParaExcluir} onClose={() => setProdutoParaExcluir(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir este produto?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProdutoParaExcluir(null)}>Cancelar</Button>
          <Button onClick={handleExcluir} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={modalMov.open} onClose={() => setModalMov({open: false, tipo: null, produtoId: null})}>
        <DialogTitle>{modalMov.tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {modalMov.tipo === 'entrada' ? 'Informe a quantidade a adicionar ao estoque.' : 'Informe a quantidade a remover do estoque.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            value={movQuantidade}
            onChange={e => setMovQuantidade(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="dense"
            label="Observação"
            type="text"
            fullWidth
            value={movObs}
            onChange={e => setMovObs(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalMov({open: false, tipo: null, produtoId: null})}>Cancelar</Button>
          <Button onClick={handleRegistrarMov} color={modalMov.tipo === 'entrada' ? 'success' : 'warning'} disabled={movLoading || movQuantidade <= 0}>
            {movLoading ? 'Salvando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!produtoMovAberto} onClose={() => setProdutoMovAberto(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Histórico de Movimentações</DialogTitle>
        <DialogContent>
          {loadingMovs ? (
            <div>Carregando...</div>
          ) : movimentacoes.length === 0 ? (
            <div>Nenhuma movimentação encontrada.</div>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Obs.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimentacoes.map((mov, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(mov.data).toLocaleString()}</TableCell>
                    <TableCell style={{ color: mov.tipo === 'entrada' ? 'green' : 'red' }}>{mov.tipo}</TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell>{mov.usuario}</TableCell>
                    <TableCell>{mov.observacao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProdutoMovAberto(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      {produtos.some(p => p.estoque?.quantidade < 10) && (
        <Collapse in={true}>
          <Alert severity="warning" className="mb-2">
            Atenção: Existem produtos com estoque baixo!
          </Alert>
        </Collapse>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({open: false, message: ''})}
        message={snackbar.message}
      />
    </div>
  );
};

export default ListaProdutos; 