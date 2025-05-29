import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, CircularProgress, MenuItem } from '@mui/material';
import { relatorioService } from '../../services/relatorioService';
import { produtoService } from '../../services/produtoService';
import { representanteService } from '../../services/representanteService';

const Relatorios: React.FC = () => {
  const [tab, setTab] = useState(0);
  // Estado para relatório 1
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading1, setLoading1] = useState(false);
  const [dados1, setDados1] = useState<any[]>([]);
  const [erro1, setErro1] = useState('');

  const buscarRelatorio1 = async () => {
    setLoading1(true);
    setErro1('');
    try {
      const data = await relatorioService.vendasPorRepresentanteMes(ano);
      setDados1(data);
    } catch (e: any) {
      setErro1('Erro ao buscar relatório');
    } finally {
      setLoading1(false);
    }
  };

  useEffect(() => {
    if (tab === 0) buscarRelatorio1();
    // eslint-disable-next-line
  }, [tab]);

  // Estado para relatório 2
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produto, setProduto] = useState('');
  const [representante, setRepresentante] = useState('');
  const [produtos, setProdutos] = useState<any[]>([]);
  const [representantes, setRepresentantes] = useState<any[]>([]);
  const [loading2, setLoading2] = useState(false);
  const [dados2, setDados2] = useState<any[]>([]);
  const [erro2, setErro2] = useState('');

  useEffect(() => {
    if (tab === 1) {
      produtoService.listar().then(setProdutos);
      representanteService.listar().then(setRepresentantes);
    }
    // eslint-disable-next-line
  }, [tab]);

  const buscarRelatorio2 = async () => {
    setLoading2(true);
    setErro2('');
    try {
      const filtros: any = {};
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;
      if (produto) filtros.produto = produto;
      if (representante) filtros.representante = representante;
      const data = await relatorioService.vendasPorPeriodoProdutoRepresentante(filtros);
      setDados2(data);
    } catch (e: any) {
      setErro2('Erro ao buscar relatório');
    } finally {
      setLoading2(false);
    }
  };

  // Estado para relatório 3
  const [dataInicio3, setDataInicio3] = useState('');
  const [dataFim3, setDataFim3] = useState('');
  const [loading3, setLoading3] = useState(false);
  const [dados3, setDados3] = useState<any[]>([]);
  const [erro3, setErro3] = useState('');

  const buscarRelatorio3 = async () => {
    setLoading3(true);
    setErro3('');
    try {
      const filtros: any = {};
      if (dataInicio3) filtros.dataInicio = dataInicio3;
      if (dataFim3) filtros.dataFim = dataFim3;
      const data = await relatorioService.rankingClientes(filtros);
      setDados3(data);
    } catch (e: any) {
      setErro3('Erro ao buscar relatório');
    } finally {
      setLoading3(false);
    }
  };

  return (
    <Box className="p-4">
      <Typography variant="h4" gutterBottom>Relatórios</Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Vendas por Representante/Mês" />
          <Tab label="Vendas por Período (Produto/Representante)" />
          <Tab label="Ranking de Clientes" />
        </Tabs>
      </Paper>
      <Box hidden={tab !== 0}>
        <Typography variant="h6">Vendas por Representante/Mês</Typography>
        <Box mt={2} mb={2} display="flex" alignItems="center" gap={2}>
          <TextField
            label="Ano"
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            size="small"
            style={{ maxWidth: 120 }}
          />
          <Button variant="contained" onClick={buscarRelatorio1} disabled={loading1}>Buscar</Button>
        </Box>
        {loading1 ? <CircularProgress /> : erro1 ? <Typography color="error">{erro1}</Typography> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Representante</TableCell>
                <TableCell>Mês</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell>Total de Vendas (R$)</TableCell>
                <TableCell>Total de Pedidos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados1.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.representante}</TableCell>
                  <TableCell>{row.mes}</TableCell>
                  <TableCell>{row.ano}</TableCell>
                  <TableCell>{row.totalVendas?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell>{row.totalPedidos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
      <Box hidden={tab !== 1}>
        <Typography variant="h6">Vendas por Período (Produto/Representante)</Typography>
        <Box mt={2} mb={2} display="flex" alignItems="center" gap={2}>
          <TextField
            label="Data Inicial"
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final"
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Produto"
            value={produto}
            onChange={e => setProduto(e.target.value)}
            size="small"
            style={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {produtos.map((p: any) => (
              <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.nome}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Representante"
            value={representante}
            onChange={e => setRepresentante(e.target.value)}
            size="small"
            style={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {representantes.map((r: any) => (
              <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={buscarRelatorio2} disabled={loading2}>Buscar</Button>
        </Box>
        {loading2 ? <CircularProgress /> : erro2 ? <Typography color="error">{erro2}</Typography> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {produto && <TableCell>Produto</TableCell>}
                {representante && <TableCell>Representante</TableCell>}
                <TableCell>Quantidade Vendida</TableCell>
                <TableCell>Valor Total Vendido (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados2.map((row, i) => (
                <TableRow key={i}>
                  {produto && <TableCell>{row.produto || '-'}</TableCell>}
                  {representante && <TableCell>{row.representante || '-'}</TableCell>}
                  <TableCell>{row.quantidadeVendida}</TableCell>
                  <TableCell>{row.valorTotalVendido?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
      <Box hidden={tab !== 2}>
        <Typography variant="h6">Ranking de Clientes</Typography>
        <Box mt={2} mb={2} display="flex" alignItems="center" gap={2}>
          <TextField
            label="Data Inicial"
            type="date"
            value={dataInicio3}
            onChange={e => setDataInicio3(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final"
            type="date"
            value={dataFim3}
            onChange={e => setDataFim3(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={buscarRelatorio3} disabled={loading3}>Buscar</Button>
        </Box>
        {loading3 ? <CircularProgress /> : erro3 ? <Typography color="error">{erro3}</Typography> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Quantidade de Pedidos</TableCell>
                <TableCell>Valor Total Comprado (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados3.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.cliente}</TableCell>
                  <TableCell>{row.quantidadePedidos}</TableCell>
                  <TableCell>{row.valorTotalComprado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default Relatorios; 