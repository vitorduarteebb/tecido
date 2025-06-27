import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ListaProdutos from './pages/admin/ListaProdutos';
import ListaClientes from './pages/admin/ListaClientes';
import ListaPedidos from './pages/admin/ListaPedidos';
import ListaRepresentantes from './pages/admin/ListaRepresentantes';
import RepDashboard from './pages/representante/Dashboard';
import ClienteDashboard from './pages/cliente/Dashboard';
import Catalogo from './pages/cliente/Catalogo';
import NotasFiscais from './pages/cliente/NotasFiscais';
import CriarPedido from './pages/representante/CriarPedido';
import DetalhePedido from './pages/DetalhePedido';
import CadastroCliente from './pages/admin/CadastroCliente';
import CadastroProduto from './pages/admin/CadastroProduto';
import CadastroRepresentante from './pages/admin/CadastroRepresentante';
import MinhasComissoes from './pages/representante/MinhasComissoes';
import Unauthorized from './pages/Unauthorized';
import HistoricoPedidosCliente from './pages/admin/HistoricoPedidosCliente';
import DetalhesCliente from './pages/admin/DetalhesCliente';
import CarteiraClientesRepresentante from './pages/admin/CarteiraClientesRepresentante';
import ListaPedidosRep from './pages/representante/ListaPedidos';
import DetalhesPedido from './pages/admin/DetalhesPedido';
import Orcamentos from './pages/representante/Orcamentos';
import Relatorios from './pages/admin/Relatorios';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastContainer />
        <Routes>
          {/* Rota raiz redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Rotas protegidas */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/produtos" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <ListaProdutos />
              </PrivateRoute>
            } />
            <Route path="/admin/produtos/novo" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroProduto />
              </PrivateRoute>
            } />
            <Route path="/admin/produtos/:id/editar" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroProduto />
              </PrivateRoute>
            } />
            <Route path="/admin/clientes" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <ListaClientes />
              </PrivateRoute>
            } />
            <Route path="/admin/clientes/novo" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroCliente />
              </PrivateRoute>
            } />
            <Route path="/admin/clientes/:id" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <DetalhesCliente />
              </PrivateRoute>
            } />
            <Route path="/admin/clientes/:id/editar" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroCliente />
              </PrivateRoute>
            } />
            <Route path="/admin/clientes/:id/pedidos" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <HistoricoPedidosCliente />
              </PrivateRoute>
            } />
            <Route path="/admin/pedidos" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <ListaPedidos />
              </PrivateRoute>
            } />
            <Route path="/admin/pedidos/:id" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <DetalhesPedido />
              </PrivateRoute>
            } />
            <Route path="/admin/pedidos/:id/editar" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <DetalhesPedido />
              </PrivateRoute>
            } />
            <Route path="/admin/representantes" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <ListaRepresentantes />
              </PrivateRoute>
            } />
            <Route path="/admin/representantes/novo" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroRepresentante />
              </PrivateRoute>
            } />
            <Route path="/admin/representantes/:id/carteira-clientes" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CarteiraClientesRepresentante />
              </PrivateRoute>
            } />
            <Route path="/admin/representantes/:id/editar" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <CadastroRepresentante />
              </PrivateRoute>
            } />
            <Route path="/admin/relatorios" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <Relatorios />
              </PrivateRoute>
            } />

            {/* Representante Routes */}
            <Route path="/representante" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <RepDashboard />
              </PrivateRoute>
            } />
            <Route path="/representante/pedidos/novo" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <CriarPedido />
              </PrivateRoute>
            } />
            <Route path="/representante/pedidos" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <ListaPedidosRep />
              </PrivateRoute>
            } />
            <Route path="/representante/clientes" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <ListaClientes />
              </PrivateRoute>
            } />
            <Route path="/representante/clientes/novo" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <CadastroCliente />
              </PrivateRoute>
            } />
            <Route path="/representante/comissoes" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <MinhasComissoes />
              </PrivateRoute>
            } />
            <Route path="/representante/orcamentos" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <Orcamentos />
              </PrivateRoute>
            } />
            <Route path="/catalogo" element={
              <PrivateRoute requiredRole="REPRESENTANTE">
                <Catalogo />
              </PrivateRoute>
            } />

            {/* Cliente Routes */}
            <Route path="/cliente" element={
              <PrivateRoute requiredRole="CLIENTE">
                <ClienteDashboard />
              </PrivateRoute>
            } />
            <Route path="/cliente/pedidos" element={
              <PrivateRoute requiredRole="CLIENTE">
                <ListaPedidos />
              </PrivateRoute>
            } />
            <Route path="/cliente/catalogo" element={
              <PrivateRoute requiredRole="CLIENTE">
                <Catalogo />
              </PrivateRoute>
            } />
            <Route path="/cliente/notas-fiscais" element={
              <PrivateRoute requiredRole="CLIENTE">
                <NotasFiscais />
              </PrivateRoute>
            } />

            {/* Rotas Comuns */}
            <Route path="/pedidos/:id" element={<DetalhePedido />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 