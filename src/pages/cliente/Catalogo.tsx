import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { produtoService } from '../../services/produtoService';
import { Produto } from '../../types/produto';

const Catalogo: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState('todos');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const data = await produtoService.listar();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProdutoClick = (produto: Produto) => {
    setSelectedProduto(produto);
    setDialogOpen(true);
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoriaFilter === 'todos' || produto.categoria === categoriaFilter;
    return matchesSearch && matchesCategory;
  });

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Catálogo de Produtos
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar produtos"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={categoriaFilter}
            label="Categoria"
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <MenuItem value="todos">Todas as Categorias</MenuItem>
            <MenuItem value="TECIDOS">Tecidos</MenuItem>
            <MenuItem value="ACESSORIOS">Acessórios</MenuItem>
            <MenuItem value="OUTROS">Outros</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {produtosFiltrados.map((produto) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={produto._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handleProdutoClick(produto)}
            >
              <CardMedia
                component="img"
                height="200"
                image={produto.imagem || '/placeholder-image.jpg'}
                alt={produto.nome}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {produto.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Código: {produto.codigo}
                </Typography>
                {produto.categoria && (
                  <Chip 
                    label={produto.categoria} 
                    size="small" 
                    sx={{ mb: 1, alignSelf: 'flex-start' }}
                  />
                )}
                <Typography variant="h6" color="primary" sx={{ mt: 'auto' }}>
                  {formatarPreco(produto.preco.valor)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estoque: {produto.estoque.quantidade} unidades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduto && (
          <>
            <DialogTitle>{selectedProduto.nome}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <img 
                    src={selectedProduto.imagem || '/placeholder-image.jpg'} 
                    alt={selectedProduto.nome}
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Detalhes do Produto
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Código:</strong> {selectedProduto.codigo}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Preço:</strong> {formatarPreco(selectedProduto.preco.valor)}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Estoque:</strong> {selectedProduto.estoque.quantidade} unidades
                  </Typography>
                  {selectedProduto.categoria && (
                    <Typography variant="body1" paragraph>
                      <strong>Categoria:</strong> {selectedProduto.categoria}
                    </Typography>
                  )}
                  {selectedProduto.descricao && (
                    <Typography variant="body1" paragraph>
                      <strong>Descrição:</strong> {selectedProduto.descricao}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Fechar
              </Button>
              <Button variant="contained" color="primary">
                Solicitar Orçamento
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Catalogo; 