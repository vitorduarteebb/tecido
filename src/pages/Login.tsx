import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Store as StoreIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { RootState } from '../store';

type UserRole = 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';

interface FormData {
  email: string;
  senha: string;
  role: UserRole;
}

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    senha: '',
    role: 'CLIENTE',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Verifica se já existe um token válido
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getUser();
        if (token && savedUser && !isAuthenticated) {
          dispatch(setCredentials({ token, user: savedUser }));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        authService.logout();
      } finally {
        setInitializing(false);
      }
    };
    
    checkAuth();
  }, [dispatch, isAuthenticated]);

  // Se estiver carregando a verificação inicial
  if (initializing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'background.default'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Se já estiver autenticado, redireciona para a rota apropriada
  if (isAuthenticated && user) {
    const roleRoutes = {
      ADMINISTRADOR: '/admin',
      REPRESENTANTE: '/representante',
      CLIENTE: '/cliente',
    };
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  const validateForm = () => {
    if (!formData.email) {
      setError('Por favor, insira seu e-mail');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Por favor, insira um e-mail válido');
      return false;
    }
    if (!formData.senha) {
      setError('Por favor, insira sua senha');
      return false;
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData);
      
      // Atualiza o estado do Redux
      dispatch(setCredentials({
        user: response.user,
        token: response.token
      }));
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Por favor, tente novamente.');
      // Limpa os dados em caso de erro
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
    setError(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container 
        component="main" 
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              <StoreIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography 
              component="h1" 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700,
                mb: 1
              }}
            >
              Loja de Tecidos
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Sistema de Gestão
            </Typography>
          </Box>

          {/* Form */}
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleTextChange}
                error={!!error && error.includes('e-mail')}
                disabled={loading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="senha"
                label="Senha"
                type="password"
                id="senha"
                autoComplete="current-password"
                value={formData.senha}
                onChange={handleTextChange}
                error={!!error && error.includes('senha')}
                disabled={loading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <FormControl 
                fullWidth 
                margin="normal"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <InputLabel id="role-label">Tipo de Usuário</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={formData.role}
                  label="Tipo de Usuário"
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
                  <MenuItem value="REPRESENTANTE">Representante</MenuItem>
                  <MenuItem value="CLIENTE">Cliente</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                  },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ 
              textAlign: 'center', 
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                © 2024 Loja de Tecidos. Todos os direitos reservados.
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 