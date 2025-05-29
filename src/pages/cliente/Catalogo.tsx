import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Autocomplete,
  MenuItem,
  Slider,
} from '@mui/material';
import { Search as SearchIcon, Send as SendIcon } from '@mui/icons-material';
import { Produto } from '../../types/produto';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Catalogo: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [quantidade, setQuantidade] = useState(1);
  const [categoria, setCategoria] = useState('');
  const [cor, setCor] = useState('');
  const [composicao, setComposicao] = useState('');
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(0);

  // Log para depuração
  console.log('Usuário logado no Catalogo:', user, 'Role:', user?.role);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data.data || []);
        setError(null);
        // Definir faixa de preço inicial
        const precos = (response.data.data || []).map((p: any) => p.preco.valor);
        setPrecoMin(Math.min(...precos, 0));
        setPrecoMax(Math.max(...precos, 0));
      } catch (err) {
        setError('Erro ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  const categorias = Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean)));
  const cores = Array.from(new Set(produtos.map(p => p.especificacoes.cor).filter(Boolean)));
  const composicoes = Array.from(new Set(produtos.map(p => p.especificacoes.composicao).filter(Boolean)));

  const produtosFiltrados = produtos.filter(produto => {
    const buscaLower = busca.toLowerCase();
    const matchBusca =
      produto.nome.toLowerCase().includes(buscaLower) ||
      produto.descricao.toLowerCase().includes(buscaLower) ||
      produto.codigo.toLowerCase().includes(buscaLower) ||
      produto.categoria.toLowerCase().includes(buscaLower) ||
      produto.especificacoes.cor?.toLowerCase().includes(buscaLower) ||
      produto.especificacoes.composicao?.toLowerCase().includes(buscaLower) ||
      produto.tags.some(tag => tag.toLowerCase().includes(buscaLower));
    const matchCategoria = !categoria || produto.categoria === categoria;
    const matchCor = !cor || produto.especificacoes.cor === cor;
    const matchComposicao = !composicao || produto.especificacoes.composicao === composicao;
    const matchPreco = produto.preco.valor >= precoMin && produto.preco.valor <= precoMax;
    return matchBusca && matchCategoria && matchCor && matchComposicao && matchPreco;
  });

  const handleSolicitarOrcamento = (produto: Produto) => {
    setSelectedProduct(produto);
    setDialogOpen(true);
  };

  const handleEnviarSolicitacao = async () => {
    if (!selectedProduct || !user) return;
    try {
      await api.post('/orcamentos/solicitar', {
        produtoId: selectedProduct._id || selectedProduct.id,
        quantidade,
        clienteId: user.id
      });
      setDialogOpen(false);
      setSnackbarOpen(true);
    } catch (err) {
      setDialogOpen(false);
      setSnackbarOpen(true);
      setError('Erro ao solicitar orçamento.');
    }
  };

  const renderEspecificacoes = (produto: Produto) => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">Código</TableCell>
            <TableCell>{produto.codigo}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Composição</TableCell>
            <TableCell>{produto.especificacoes.composicao}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Largura</TableCell>
            <TableCell>{produto.especificacoes.largura}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Gramatura</TableCell>
            <TableCell>{produto.especificacoes.gramatura}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Rendimento</TableCell>
            <TableCell>{produto.especificacoes.rendimento}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Cor</TableCell>
            <TableCell>{produto.especificacoes.cor}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Padronagem</TableCell>
            <TableCell>{produto.especificacoes.padronagem}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="p-4">
      <Typography variant="h5" component="h1" gutterBottom>
        Catálogo de Produtos
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography>Carregando produtos...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Buscar"
              placeholder="Nome, código, descrição, categoria, cor, composição"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <TextField
              select
              label="Categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
              disabled={categorias.length === 0}
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Cor"
              value={cor}
              onChange={e => setCor(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              disabled={cores.length === 0}
            >
              <MenuItem value="">Todas</MenuItem>
              {cores.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <Autocomplete
              options={composicoes}
              value={composicao}
              onChange={(_, v) => setComposicao(v || '')}
              renderInput={(params) => <TextField {...params} label="Composição" size="small" sx={{ minWidth: 140 }} disabled={composicoes.length === 0} />}
              freeSolo
            />
            <Box sx={{ minWidth: 180 }}>
              <Typography variant="caption">Preço</Typography>
              <Slider
                value={[precoMin, precoMax]}
                onChange={(_, v) => Array.isArray(v) && (setPrecoMin(v[0]), setPrecoMax(v[1]))}
                min={Math.min(...produtos.map(p => p.preco.valor), 0)}
                max={Math.max(...produtos.map(p => p.preco.valor), 0)}
                valueLabelDisplay="auto"
                size="small"
                sx={{ mt: -1 }}
              />
            </Box>
          </Box>
          <Grid container spacing={1}>
            {produtosFiltrados.map((produto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={produto.id}>
                <Card sx={{ height: 240, display: 'flex', flexDirection: 'column', boxShadow: 1, p: 1 }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={produto.imagem}
                    alt={produto.nome}
                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 1 }}>
                    <Typography gutterBottom variant="subtitle2" fontWeight={600} noWrap>
                      {produto.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      Código: {produto.codigo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 0.5 }} noWrap>
                      {produto.descricao}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 0.5 }}>
                      R$ {produto.preco.valor.toFixed(2)}/{produto.preco.unidade}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                      {produto.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Button size="small" variant="outlined" onClick={() => { setSelectedProduct(produto); setDialogOpen(true); }}>
                        Detalhes
                      </Button>
                      {user?.role === 'CLIENTE' && (
                        <Button size="small" variant="contained" color="primary" onClick={() => handleSolicitarOrcamento(produto)}>
                          Orçamento
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Dialog open={dialogOpen && !!selectedProduct} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes do Produto</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <img src={selectedProduct.imagem} alt={selectedProduct.nome} style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>{selectedProduct.nome}</Typography>
                <Typography variant="body2" color="text.secondary">Código: {selectedProduct.codigo}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedProduct.descricao}</Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  R$ {selectedProduct.preco.valor.toFixed(2)}/{selectedProduct.preco.unidade}
                </Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow><TableCell>Código</TableCell><TableCell>{selectedProduct.codigo}</TableCell></TableRow>
                    <TableRow><TableCell>Composição</TableCell><TableCell>{selectedProduct.especificacoes.composicao}</TableCell></TableRow>
                    <TableRow><TableCell>Largura</TableCell><TableCell>{selectedProduct.especificacoes.largura}</TableCell></TableRow>
                    <TableRow><TableCell>Gramatura</TableCell><TableCell>{selectedProduct.especificacoes.gramatura}</TableCell></TableRow>
                    <TableRow><TableCell>Rendimento</TableCell><TableCell>{selectedProduct.especificacoes.rendimento}</TableCell></TableRow>
                    <TableRow><TableCell>Cor</TableCell><TableCell>{selectedProduct.especificacoes.cor}</TableCell></TableRow>
                    <TableRow><TableCell>Padronagem</TableCell><TableCell>{selectedProduct.especificacoes.padronagem}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Solicitação enviada com sucesso! Seu representante entrará em contato.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Catalogo; 