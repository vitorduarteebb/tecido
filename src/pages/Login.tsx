import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
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
} from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Acesso ao Sistema - Loja de Tecidos
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Tipo de Usuário</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Tipo de Usuário"
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <MenuItem value="CLIENTE">Cliente</MenuItem>
                  <MenuItem value="REPRESENTANTE">Representante</MenuItem>
                  <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Entrar'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login; 