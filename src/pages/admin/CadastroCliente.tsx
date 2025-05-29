import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { clienteService } from '../../services/clienteService';

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Credenciais {
  email: string;
  senha: string;
  confirmarSenha: string;
}

interface APICliente {
  id?: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: Endereco;
  status: 'ativo' | 'inativo';
  representante: string;
  limiteCredito: number;
  condicaoPagamento: string;
  usuario?: string;
  nomeResponsavel: string;
}

interface Cliente extends Omit<APICliente, 'usuario'> {
  credenciais: Credenciais;
}

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const condicoesPagamento = [
  '30 dias',
  '30/60 dias',
  '30/60/90 dias',
  'À vista',
  'Outros'
];

interface Step {
  label: string;
  content: JSX.Element;
}

const CadastroCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [senhaError, setSenhaError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<Cliente>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    status: 'ativo',
    representante: '',
    limiteCredito: 0,
    condicaoPagamento: '',
    credenciais: {
      email: '',
      senha: '',
      confirmarSenha: '',
    },
    nomeResponsavel: '',
  });

  useEffect(() => {
    const carregarCliente = async () => {
      if (!id) return;

      try {
        setInitialLoading(true);
        const data = await clienteService.obterPorId(id);
        if (!data) {
          setError('Cliente não encontrado');
          return;
        }

        // Remover campos sensíveis e adaptar para o formato do formulário
        const clienteData = data as APICliente;
        
        // Garantir que todos os campos obrigatórios estejam presentes
        const dadosFormatados = {
          ...clienteData,
          credenciais: {
            email: clienteData.email || '',
            senha: '',
            confirmarSenha: ''
          },
          // Garantir que o endereço tenha todos os campos necessários
          endereco: {
            cep: clienteData.endereco?.cep || '',
            logradouro: clienteData.endereco?.logradouro || '',
            numero: clienteData.endereco?.numero || '',
            complemento: clienteData.endereco?.complemento || '',
            bairro: clienteData.endereco?.bairro || '',
            cidade: clienteData.endereco?.cidade || '',
            estado: clienteData.endereco?.estado || '',
          },
          // Garantir que campos numéricos sejam números válidos
          limiteCredito: Number(clienteData.limiteCredito) || 0,
          // Garantir que campos de texto tenham valores válidos
          representante: clienteData.representante || '',
          condicaoPagamento: clienteData.condicaoPagamento || '',
          status: clienteData.status || 'ativo',
          nomeResponsavel: clienteData.nomeResponsavel || '',
        };

        setFormData(dadosFormatados);
        setError('');
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Erro ao carregar os dados do cliente. Por favor, tente novamente.');
      } finally {
        setInitialLoading(false);
      }
    };

    carregarCliente();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(''); // Limpa erros ao editar
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((parent === 'endereco' ? prev.endereco : parent === 'credenciais' ? prev.credenciais : {}) || {}),
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
    setError(''); // Limpa erros ao editar
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((parent === 'endereco' ? prev.endereco : parent === 'credenciais' ? prev.credenciais : {}) || {}),
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

  const buscarCEP = async () => {
    if (!formData.endereco.cep || formData.endereco.cep.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${formData.endereco.cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }
      }));
      setError('');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setError('Erro ao buscar CEP. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validarEtapaAtual = () => {
    switch (activeStep) {
      case 0: // Dados básicos
        if (!formData.razaoSocial || !formData.nomeFantasia || !formData.cnpj || !formData.inscricaoEstadual) {
          setError('Preencha todos os campos obrigatórios');
          return false;
        }
        break;
      case 1: // Contato
        if (!formData.nomeResponsavel || !formData.email || !formData.telefone || !formData.celular) {
          setError('Preencha todos os campos obrigatórios');
          return false;
        }
        break;
      case 2: // Endereço
        if (!formData.endereco.cep || !formData.endereco.logradouro || !formData.endereco.numero || 
            !formData.endereco.bairro || !formData.endereco.cidade || !formData.endereco.estado) {
          setError('Preencha todos os campos obrigatórios do endereço');
          return false;
        }
        break;
      case 3: // Financeiro
        if (!formData.representante || formData.limiteCredito <= 0 || !formData.condicaoPagamento) {
          setError('Preencha todos os campos obrigatórios');
          return false;
        }
        break;
      case 4: // Credenciais (só validar em modo de criação)
        if (!isEditMode && (!formData.credenciais.email || !formData.credenciais.senha || !formData.credenciais.confirmarSenha)) {
          setError('Preencha todos os campos obrigatórios');
          return false;
        }
        if (!isEditMode && !validarSenha()) {
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    // Em modo de edição, só validamos se os dados já foram carregados
    if (isEditMode && !initialLoading) {
      if (!validarEtapaAtual()) {
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const validarSenha = () => {
    if (formData.credenciais.senha !== formData.credenciais.confirmarSenha) {
      setSenhaError('As senhas não coincidem');
      return false;
    }
    if (formData.credenciais.senha.length < 6) {
      setSenhaError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    setSenhaError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Em modo de edição, validamos apenas se os dados já foram carregados
    if (isEditMode && !initialLoading) {
      if (!validarEtapaAtual()) {
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const { confirmarSenha, ...credenciaisParaEnvio } = formData.credenciais;
      const dadosParaEnvio = {
        ...formData,
        credenciais: isEditMode ? undefined : credenciaisParaEnvio,
        nomeResponsavel: formData.nomeResponsavel,
      };

      if (isEditMode) {
        await clienteService.atualizar(id, dadosParaEnvio);
        setSuccessMessage('Cliente atualizado com sucesso!');
      } else {
        await clienteService.criar(dadosParaEnvio);
        setSuccessMessage('Cliente criado com sucesso!');
      }

      // Aguarda um momento para mostrar a mensagem de sucesso
      setTimeout(() => {
        navigate('/admin/clientes');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      setError(err.response?.data?.message || 'Erro ao salvar cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const steps: Step[] = [
    {
      label: 'Dados Básicos',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Razão Social"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome Fantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputMask
              mask="99.999.999/9999-99"
              value={formData.cnpj}
              onChange={handleChange}
            >
              {() => (
                <TextField
                  fullWidth
                  label="CNPJ"
                  name="cnpj"
                  required
                />
              )}
            </InputMask>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Inscrição Estadual"
              name="inscricaoEstadual"
              value={formData.inscricaoEstadual}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Contato',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do Responsável"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputMask
              mask="(99) 9999-9999"
              value={formData.telefone}
              onChange={handleChange}
            >
              {() => (
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  required
                />
              )}
            </InputMask>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputMask
              mask="(99) 99999-9999"
              value={formData.celular}
              onChange={handleChange}
            >
              {() => (
                <TextField
                  fullWidth
                  label="WhatsApp"
                  name="celular"
                  required
                />
              )}
            </InputMask>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Endereço',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <InputMask
              mask="99999-999"
              value={formData.endereco.cep}
              onChange={handleChange}
            >
              {() => (
                <TextField
                  fullWidth
                  label="CEP"
                  name="endereco.cep"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={buscarCEP} edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </InputMask>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Logradouro"
              name="endereco.logradouro"
              value={formData.endereco.logradouro}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Número"
              name="endereco.numero"
              value={formData.endereco.numero}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Complemento"
              name="endereco.complemento"
              value={formData.endereco.complemento}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Bairro"
              name="endereco.bairro"
              value={formData.endereco.bairro}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Cidade"
              name="endereco.cidade"
              value={formData.endereco.cidade}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="endereco.estado"
                value={formData.endereco.estado}
                label="Estado"
                onChange={handleSelectChange}
                required
              >
                {estadosBrasileiros.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Informações Comerciais',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Representante"
              name="representante"
              value={formData.representante}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Limite de Crédito"
              name="limiteCredito"
              value={formData.limiteCredito}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Condição de Pagamento</InputLabel>
              <Select
                name="condicaoPagamento"
                value={formData.condicaoPagamento}
                label="Condição de Pagamento"
                onChange={handleSelectChange}
                required
              >
                {condicoesPagamento.map((condicao) => (
                  <MenuItem key={condicao} value={condicao}>
                    {condicao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Credenciais de Acesso',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="E-mail para Login"
              name="credenciais.email"
              type="email"
              value={formData.credenciais.email}
              onChange={handleChange}
              required={!isEditMode}
              disabled={isEditMode}
              helperText={isEditMode ? "O e-mail não pode ser alterado" : "Este será o e-mail utilizado para acessar o sistema"}
            />
          </Grid>
          {!isEditMode && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha"
                  name="credenciais.senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.credenciais.senha}
                  onChange={handleChange}
                  required
                  error={!!senhaError}
                  helperText="A senha deve ter pelo menos 6 caracteres"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Senha"
                  name="credenciais.confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.credenciais.confirmarSenha}
                  onChange={handleChange}
                  required
                  error={!!senhaError}
                  helperText={senhaError || 'Digite a senha novamente para confirmar'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      ),
    },
  ];

  if (initialLoading) {
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <Breadcrumbs className="mb-4">
        <Link
          component="button"
          onClick={() => navigate('/admin/clientes')}
          color="inherit"
        >
          Clientes
        </Link>
        <Typography color="textPrimary">
          {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>
      </Breadcrumbs>

      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/clientes')}
        >
          Voltar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Paper className="p-6">
        <form onSubmit={handleSubmit}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {step.content}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Box className="mt-4 flex justify-between">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBeforeIcon />}
            >
              Voltar
            </Button>
            <div>
              {activeStep === 4 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Salvando...' : 'Salvar Cliente'}
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
            </div>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CadastroCliente; 