import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Acesso Não Autorizado
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Você não tem permissão para acessar esta página. Por favor, verifique suas credenciais ou entre em contato com o administrador.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized; 