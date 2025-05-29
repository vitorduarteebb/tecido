import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const NotasFiscais: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [dataInicial, setDataInicial] = useState<Date | null>(null);
  const [dataFinal, setDataFinal] = useState<Date | null>(null);

  // TODO: Integrar com API
  const notasFiscais = [
    {
      id: 1,
      numero: '000001',
      pedido: '#1234',
      data: '2024-03-15',
      valor: 2999.90,
      status: 'Emitida',
      chaveAcesso: '35240307128802000132550010000000011000000016'
    },
    {
      id: 2,
      numero: '000002',
      pedido: '#1235',
      data: '2024-03-14',
      valor: 1589.90,
      status: 'Emitida',
      chaveAcesso: '35240307128802000132550010000000021000000026'
    },
  ];

  const handleDownload = (chaveAcesso: string) => {
    // TODO: Implementar download do PDF da nota fiscal
    console.log('Download NF:', chaveAcesso);
  };

  const handleVisualizar = (chaveAcesso: string) => {
    // TODO: Implementar visualização da nota fiscal
    console.log('Visualizar NF:', chaveAcesso);
    window.open(`https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&nfe=${chaveAcesso}`, '_blank');
  };

  const notasFiltradas = notasFiscais.filter(nota => {
    const matchBusca = 
      nota.numero.toLowerCase().includes(busca.toLowerCase()) ||
      nota.pedido.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;

    if (dataInicial && dataFinal) {
      const dataNota = new Date(nota.data);
      return dataNota >= dataInicial && dataNota <= dataFinal;
    }

    return true;
  });

  return (
    <div className="p-4">
      <Typography variant="h5" component="h1" gutterBottom>
        Notas Fiscais
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Buscar por número da nota ou pedido"
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
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Inicial"
              value={dataInicial}
              onChange={(newValue: Date | null) => setDataInicial(newValue)}
            />
            <DatePicker
              label="Data Final"
              value={dataFinal}
              onChange={(newValue: Date | null) => setDataFinal(newValue)}
            />
          </LocalizationProvider>
          {(dataInicial || dataFinal || busca) && (
            <Button
              variant="outlined"
              onClick={() => {
                setBusca('');
                setDataInicial(null);
                setDataFinal(null);
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Pedido</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notasFiltradas.map((nota) => (
              <TableRow key={nota.id}>
                <TableCell>{nota.numero}</TableCell>
                <TableCell>{nota.pedido}</TableCell>
                <TableCell>{new Date(nota.data).toLocaleDateString()}</TableCell>
                <TableCell align="right">R$ {nota.valor.toFixed(2)}</TableCell>
                <TableCell>{nota.status}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleVisualizar(nota.chaveAcesso)}
                    title="Visualizar"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(nota.chaveAcesso)}
                    title="Download PDF"
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default NotasFiscais; 