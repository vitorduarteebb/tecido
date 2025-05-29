import React, { useState, useEffect } from 'react';
import { 
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { representanteService } from '../../services/representanteService';

const CadastroRepresentante: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    regiao: '',
    status: 'Ativo',
    comissao: '',
    senha: '',
    confirmarSenha: ''
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      representanteService.obter(id as string)
        .then(rep => {
          setFormData({
            nome: rep.nome || '',
            email: rep.email || '',
            telefone: rep.telefone || '',
            regiao: rep.regiao || '',
            status: rep.status || 'Ativo',
            comissao: rep.comissao ? String(rep.comissao) : '',
            senha: '',
            confirmarSenha: ''
          });
        })
        .catch(() => setError('Erro ao carregar representante'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (showPasswordFields) {
        if (formData.senha !== formData.confirmarSenha) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        if (formData.senha && formData.senha.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
      }
      const { confirmarSenha, ...rest } = formData;
      let dadosParaEnvio: Record<string, any> = { ...rest };
      if (!dadosParaEnvio.email) dadosParaEnvio.email = '';
      if (!dadosParaEnvio.status) dadosParaEnvio.status = 'ativo';
      if (!dadosParaEnvio.nome) dadosParaEnvio.nome = '';
      if (!dadosParaEnvio.telefone) dadosParaEnvio.telefone = '';
      if (!dadosParaEnvio.regiao) dadosParaEnvio.regiao = '';
      if (!showPasswordFields) {
        delete dadosParaEnvio.senha;
      }
      if (dadosParaEnvio.comissao !== undefined && dadosParaEnvio.comissao !== '') {
        dadosParaEnvio.comissao = Number(dadosParaEnvio.comissao);
      }
      if (isEdit) {
        await representanteService.atualizar(id as string, dadosParaEnvio);
      } else {
        await representanteService.criar(dadosParaEnvio);
      }
      navigate('/admin/representantes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar representante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Editar Representante' : 'Cadastro de Representante'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Região"
                name="regiao"
                value={formData.regiao}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Comissão (%)"
                name="comissao"
                type="number"
                value={formData.comissao}
                onChange={handleInputChange}
                disabled={loading}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="Porcentagem de comissão do representante"
              />
            </Grid>
            {(isEdit ? showPasswordFields : true) && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required={!isEdit}
                    fullWidth
                    label="Senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required={!isEdit}
                    fullWidth
                    label="Confirmar Senha"
                    name="confirmarSenha"
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    disabled={loading}
                    error={formData.senha !== formData.confirmarSenha}
                    helperText={formData.senha !== formData.confirmarSenha ? 'As senhas não coincidem' : ''}
                  />
                </Grid>
              </>
            )}
            {isEdit && !showPasswordFields && (
              <Grid item xs={12}>
                <Button variant="outlined" onClick={() => setShowPasswordFields(true)} disabled={loading}>
                  Alterar senha
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/representantes')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CadastroRepresentante; 