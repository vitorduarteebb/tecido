import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const Catalogo: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');

  // TODO: Integrar com API
  const produtos = [
    {
      id: 1,
      nome: 'Tecido Algodão',
      descricao: 'Tecido 100% algodão, ideal para roupas leves e frescas',
      preco: 29.90,
      categoria: 'Algodão',
      imagem: 'https://via.placeholder.com/300x200',
      composicao: '100% Algodão',
      largura: '1,40m',
      gramatura: '150g/m²'
    },
    {
      id: 2,
      nome: 'Tecido Seda',
      descricao: 'Tecido de seda pura, perfeito para peças sofisticadas',
      preco: 89.90,
      categoria: 'Seda',
      imagem: 'https://via.placeholder.com/300x200',
      composicao: '100% Seda',
      largura: '1,40m',
      gramatura: '80g/m²'
    },
    {
      id: 3,
      nome: 'Tecido Linho',
      descricao: 'Tecido de linho natural, ótimo para roupas de verão',
      preco: 59.90,
      categoria: 'Linho',
      imagem: 'https://via.placeholder.com/300x200',
      composicao: '100% Linho',
      largura: '1,40m',
      gramatura: '200g/m²'
    },
  ];

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      produto.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoria || produto.categoria === categoria;
    return matchBusca && matchCategoria;
  });

  return (
    <div className="p-4">
      <Typography variant="h5" component="h1" gutterBottom>
        Catálogo de Produtos
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Buscar produtos"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={categoria}
                label="Categoria"
                onChange={(e) => setCategoria(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {produtosFiltrados.map((produto) => (
          <Grid item xs={12} sm={6} md={4} key={produto.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={produto.imagem}
                alt={produto.nome}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {produto.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {produto.descricao}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  R$ {produto.preco.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Composição:</strong> {produto.composicao}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Largura:</strong> {produto.largura}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Gramatura:</strong> {produto.gramatura}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Catalogo; 