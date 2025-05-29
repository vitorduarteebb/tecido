import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Card,
  CardMedia,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Produto } from '../../types/produto';
import { produtoService } from '../../services/produtoService';
import api from '../../services/api';

declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
      [key: string]: any;
    };
  }
}

const CadastroProduto: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
    codigo: '',
    nome: '',
    descricao: '',
    imagem: '',
    especificacoes: {
      composicao: '',
      largura: '',
      gramatura: '',
      rendimento: '',
      cor: '',
      padronagem: '',
    },
    preco: {
      valor: 0,
      unidade: 'metro',
    },
    precoAVista: 0,
    precoAPrazo: 0,
    pesoPorMetro: 0,
    estoque: {
      quantidade: 0,
      unidade: 'metro',
    },
    categoria: '',
    tags: [],
    dataCadastro: new Date().toISOString(),
    status: 'ativo',
  });

  const [novaTag, setNovaTag] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const produto = await produtoService.obterPorId(id);
          setFormData({
            ...produto,
            dataCadastro: produto.dataCadastro || new Date().toISOString(),
          });
          setImagePreview(produto.imagem || null);
        } catch {
          setErro('Erro ao carregar produto para edição.');
        }
      })();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const uploadImagem = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('imagem', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return backendUrl + response.data.url;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      try {
        const url = await uploadImagem(file);
        setFormData(prev => ({
          ...prev,
          imagem: url
        }));
      } catch {
        setErro('Erro ao fazer upload da imagem');
      }
    }
  };

  const handleAddTag = () => {
    if (novaTag.trim() && !formData.tags.includes(novaTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, novaTag.trim()]
      }));
      setNovaTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    try {
      if (id) {
        await produtoService.atualizar(id, formData);
        setSucesso('Produto atualizado com sucesso!');
      } else {
        await produtoService.criar(formData);
        setSucesso('Produto cadastrado com sucesso!');
      }
      setTimeout(() => navigate('/admin/produtos'), 1000);
    } catch (err) {
      setErro('Erro ao salvar produto.');
    }
  };

  const steps = [
    {
      label: 'Informações Básicas',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3, position: 'relative' }}>
              <Box
                sx={{
                  height: 200,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.100',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <CardMedia
                    component="img"
                    image={imagePreview}
                    alt="Preview"
                    sx={{ height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                    <Typography color="textSecondary">
                      Clique para fazer upload da imagem
                    </Typography>
                  </Box>
                )}
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Especificações',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Composição"
              name="especificacoes.composicao"
              value={formData.especificacoes.composicao}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Largura"
              name="especificacoes.largura"
              value={formData.especificacoes.largura}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gramatura"
              name="especificacoes.gramatura"
              value={formData.especificacoes.gramatura}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rendimento"
              name="especificacoes.rendimento"
              value={formData.especificacoes.rendimento}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cor"
              name="especificacoes.cor"
              value={formData.especificacoes.cor}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Padronagem"
              name="especificacoes.padronagem"
              value={formData.especificacoes.padronagem}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Preço e Estoque',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Valor"
              name="preco.valor"
              value={formData.preco.valor}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Unidade de Venda</InputLabel>
              <Select
                name="preco.unidade"
                value={formData.preco.unidade}
                label="Unidade de Venda"
                onChange={handleSelectChange}
              >
                <MenuItem value="metro">Metro</MenuItem>
                <MenuItem value="kg">Quilograma</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Preço à Vista"
              name="precoAVista"
              value={formData.precoAVista ?? ''}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Preço a Prazo"
              name="precoAPrazo"
              value={formData.precoAPrazo ?? ''}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Peso por Metro (kg)"
              name="pesoPorMetro"
              value={formData.pesoPorMetro ?? ''}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">kg/metro</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Quantidade em Estoque"
              name="estoque.quantidade"
              value={formData.estoque.quantidade}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Unidade de Estoque</InputLabel>
              <Select
                name="estoque.unidade"
                value={formData.estoque.unidade}
                label="Unidade de Estoque"
                onChange={handleSelectChange}
              >
                <MenuItem value="metro">Metro</MenuItem>
                <MenuItem value="kg">Quilograma</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Categorização',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Adicionar Tag"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddTag} edge="end">
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Editar Produto' : 'Cadastro de Produto'}
      </Typography>

      {erro && <Alert severity="error">{erro}</Alert>}
      {sucesso && <Alert severity="success">{sucesso}</Alert>}

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {step.content}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={index === 0}
                        startIcon={<NavigateBeforeIcon />}
                      >
                        Voltar
                      </Button>
                      {index === steps.length - 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          endIcon={<NavigateNextIcon />}
                        >
                          Finalizar Cadastro
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<NavigateNextIcon />}
                        >
                          Próximo
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </form>
      </Paper>
    </Box>
  );
};

export default CadastroProduto; 