import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress
} from '@mui/material';

const MinhasComissoes: React.FC = () => {
  const [loading] = useState(false);

  useEffect(() => {
    // Funcionalidade não implementada
  }, []);

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
        Minhas Comissões
      </Typography>
      <Typography color="error">Funcionalidade não implementada</Typography>
    </Container>
  );
};

export default MinhasComissoes; 