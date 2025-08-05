import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { CloudUpload, Download } from '@mui/icons-material';
import api from '../../services/api';

interface ImportResult {
  message: string;
  total: number;
  sucessos: number;
  duplicados: number;
  erros: number;
  errosDetalhados: string[];
}

const Importacao: React.FC = () => {
  const [clientesFile, setClientesFile] = useState<File | null>(null);
  const [produtosFile, setProdutosFile] = useState<File | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [resultClientes, setResultClientes] = useState<ImportResult | null>(null);
  const [resultProdutos, setResultProdutos] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'clientes' | 'produtos') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'clientes') {
        setClientesFile(file);
      } else {
        setProdutosFile(file);
      }
      setError(null);
    }
  };

  const importClientes = async () => {
    if (!clientesFile) {
      setError('Selecione um arquivo para importar clientes');
      return;
    }

    setLoadingClientes(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', clientesFile);

      const response = await api.post('/import/clientes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultClientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao importar clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const importProdutos = async () => {
    if (!produtosFile) {
      setError('Selecione um arquivo para importar produtos');
      return;
    }

    setLoadingProdutos(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', produtosFile);

      const response = await api.post('/import/produtos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultProdutos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao importar produtos');
    } finally {
      setLoadingProdutos(false);
    }
  };

  const downloadTemplate = (type: 'clientes' | 'produtos') => {
    if (type === 'produtos') {
      // Criar um link para download do template de produtos
      const link = document.createElement('a');
      link.href = '/api/template-produtos';
      link.download = 'template_produtos.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Para clientes, ainda será implementado
      alert(`Template de ${type} será implementado`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Importação em Massa
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Importe clientes e produtos em grande escala através de arquivos Excel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Importação de Clientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Importar Clientes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Faça upload de um arquivo Excel (.xls ou .xlsx) com os dados dos clientes
              </Typography>

              <Box sx={{ mb: 2 }}>
                <input
                  accept=".xls,.xlsx"
                  style={{ display: 'none' }}
                  id="clientes-file"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'clientes')}
                />
                <label htmlFor="clientes-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                  >
                    Selecionar Arquivo
                  </Button>
                </label>
              </Box>

              {clientesFile && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Arquivo selecionado: {clientesFile.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={importClientes}
                disabled={!clientesFile || loadingClientes}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loadingClientes ? <CircularProgress size={24} /> : 'Importar Clientes'}
              </Button>

              <Button
                variant="text"
                startIcon={<Download />}
                onClick={() => downloadTemplate('clientes')}
                fullWidth
              >
                Baixar Template
              </Button>
            </CardContent>
          </Card>

          {resultClientes && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resultado da Importação
                </Typography>
                <Typography variant="body2">
                  Total: {resultClientes.total} | 
                  Sucessos: {resultClientes.sucessos} | 
                  Duplicados: {resultClientes.duplicados} | 
                  Erros: {resultClientes.erros}
                </Typography>
                {resultClientes.errosDetalhados.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Erros detalhados:
                    </Typography>
                    {resultClientes.errosDetalhados.slice(0, 5).map((erro, index) => (
                      <Typography key={index} variant="body2" color="error">
                        {erro}
                      </Typography>
                    ))}
                    {resultClientes.errosDetalhados.length > 5 && (
                      <Typography variant="body2" color="text.secondary">
                        ... e mais {resultClientes.errosDetalhados.length - 5} erros
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Importação de Produtos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Importar Produtos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Faça upload de um arquivo Excel (.xls ou .xlsx) com os dados dos produtos
              </Typography>

              <Box sx={{ mb: 2 }}>
                <input
                  accept=".xls,.xlsx"
                  style={{ display: 'none' }}
                  id="produtos-file"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'produtos')}
                />
                <label htmlFor="produtos-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                  >
                    Selecionar Arquivo
                  </Button>
                </label>
              </Box>

              {produtosFile && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Arquivo selecionado: {produtosFile.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={importProdutos}
                disabled={!produtosFile || loadingProdutos}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loadingProdutos ? <CircularProgress size={24} /> : 'Importar Produtos'}
              </Button>

              <Button
                variant="text"
                startIcon={<Download />}
                onClick={() => downloadTemplate('produtos')}
                fullWidth
              >
                Baixar Template
              </Button>
            </CardContent>
          </Card>

          {resultProdutos && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resultado da Importação
                </Typography>
                <Typography variant="body2">
                  Total: {resultProdutos.total} | 
                  Sucessos: {resultProdutos.sucessos} | 
                  Duplicados: {resultProdutos.duplicados} | 
                  Erros: {resultProdutos.erros}
                </Typography>
                {resultProdutos.errosDetalhados.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Erros detalhados:
                    </Typography>
                    {resultProdutos.errosDetalhados.slice(0, 5).map((erro, index) => (
                      <Typography key={index} variant="body2" color="error">
                        {erro}
                      </Typography>
                    ))}
                    {resultProdutos.errosDetalhados.length > 5 && (
                      <Typography variant="body2" color="text.secondary">
                        ... e mais {resultProdutos.errosDetalhados.length - 5} erros
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Instruções para Importação
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Para Clientes:</strong> O arquivo deve conter as colunas: Razão Social, Nome Fantasia, CNPJ, 
          Inscrição Estadual, Email, Telefone, Celular, Endereço, Cidade, Estado, CEP, Representantes.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Para Produtos:</strong> O arquivo deve conter as colunas: Código do produto, Nome do produto, 
          Preço de Tabela, Comissão, Unidade, Quantidade em estoque, Peso bruto por metro (em Kg), 
          Categoria principal, Subcategoria, Tabela a Vista.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Registros duplicados (mesmo CNPJ para clientes ou mesmo código para produtos) 
          serão ignorados automaticamente.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Importacao; 