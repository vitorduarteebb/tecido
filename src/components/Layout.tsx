import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  People,
  Inventory,
  ExitToApp,
  Group as GroupIcon,
  AddShoppingCart,
  AttachMoney,
  Receipt,
} from '@mui/icons-material';
import { RootState } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { pedidoService } from '../services/pedidoService';
import { orcamentoService } from '../services/orcamentoService';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

interface MenuItems {
  admin: MenuItem[];
  representante: MenuItem[];
  cliente: MenuItem[];
}

type RoleKey = keyof MenuItems;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';
}

// Define menuItems first
const menuItems: MenuItems = {
    admin: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
      { text: 'Produtos', icon: <Inventory />, path: '/admin/produtos' },
      { text: 'Representantes', icon: <GroupIcon />, path: '/admin/representantes' },
      { text: 'Clientes', icon: <People />, path: '/admin/clientes' },
      { text: 'Pedidos', icon: <ShoppingCart />, path: '/admin/pedidos' },
      { text: 'Relatórios', icon: <AttachMoney />, path: '/admin/relatorios' },
    ],
    representante: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/representante' },
      { text: 'Produtos', icon: <Inventory />, path: '/catalogo' },
      { text: 'Meus Clientes', icon: <People />, path: '/representante/clientes' },
      { text: 'Criar Pedido', icon: <AddShoppingCart />, path: '/representante/pedidos/novo' },
      { text: 'Meus Pedidos', icon: <ShoppingCart />, path: '/representante/pedidos' },
      { text: 'Minhas Comissões', icon: <AttachMoney />, path: '/representante/comissoes' },
      { text: 'Solicitações de Orçamento', icon: <Receipt />, path: '/representante/orcamentos' },
    ],
    cliente: [
      { text: 'Meus Pedidos', icon: <ShoppingCart />, path: '/cliente/pedidos' },
      { text: 'Notas Fiscais', icon: <Receipt />, path: '/cliente/notas-fiscais' },
      { text: 'Catálogo', icon: <Inventory />, path: '/cliente/catalogo' },
    ],
  };

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [orcamentosPendentes, setOrcamentosPendentes] = useState(0);

  const getUserRole = (role: User['role']): RoleKey => {
    console.log('Role from user:', role);
    switch (role) {
      case 'ADMINISTRADOR':
        console.log('Mapping ADMINISTRADOR to admin');
        return 'admin';
      case 'REPRESENTANTE':
        console.log('Mapping REPRESENTANTE to representante');
        return 'representante';
      case 'CLIENTE':
        console.log('Mapping CLIENTE to cliente');
        return 'cliente';
      default:
        console.log('Using default role: cliente');
        return 'cliente';
    }
  };

  const userRole = getUserRole(user?.role || 'CLIENTE');
  console.log('Mapped role:', userRole);
  console.log('Available menu items:', Object.keys(menuItems));
  console.log('Menu items for role:', menuItems[userRole]);

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getUser();

        console.log('Layout - Inicializando:', {
          hasToken: !!token,
          hasSavedUser: !!savedUser,
          currentUser: user,
          pathname: location.pathname,
          isAuthenticated
        });

        // Se não há token ou usuário no localStorage, redireciona para login
        if (!token || !savedUser) {
          console.log('Layout - Redirecionando para login (sem token/usuário no localStorage)');
          dispatch(logout());
          return;
        }

        // Se há token e usuário no localStorage mas não no Redux, atualiza o Redux
        if (!isAuthenticated) {
          console.log('Layout - Atualizando Redux com dados do localStorage');
          dispatch(setCredentials({ token, user: savedUser }));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Layout - Erro ao inicializar:', error);
        dispatch(logout());
      }
    };

    initializeLayout();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (userRole === 'representante' && user?.id) {
      pedidoService.listarPorRepresentante(user.id).then(pedidos => {
        setPedidosPendentes(pedidos.filter(p => p.status === 'pendente' || !p.status).length);
      });
    }
  }, [userRole, user]);

  useEffect(() => {
    if (userRole === 'representante' && user?.id) {
      orcamentoService.listarPorRepresentante().then(orcamentos => {
        setOrcamentosPendentes(orcamentos.filter(o => o.status === 'pendente').length);
      });
    }
  }, [userRole, user]);

  // Mostra loading enquanto inicializa
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#fff',
        zIndex: 9999
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado após a inicialização, redireciona para login
  if (!isAuthenticated) {
    console.log('Layout - Redirecionando para login (não autenticado)');
    return <Navigate to="/login" replace />;
  }

  // Se não houver usuário após a inicialização, redireciona para login
  if (!user) {
    console.log('Layout - Redirecionando para login (sem usuário)');
    return <Navigate to="/login" replace />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log('Layout - Realizando logout');
    authService.logout();
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    console.log('Layout - Navegando para:', path);
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Loja de Tecidos
        </Typography>
      </Toolbar>
      <List>
        {menuItems[userRole].map((item: MenuItem) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            {item.text === 'Solicitações de Orçamento' ? (
              <ListItemIcon>
                <Badge badgeContent={orcamentosPendentes} color="error" invisible={orcamentosPendentes === 0}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
            ) : item.text === 'Meus Pedidos' ? (
              <ListItemIcon>
                <Badge badgeContent={pedidosPendentes} color="error" invisible={pedidosPendentes === 0}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
            ) : (
              <ListItemIcon>{item.icon}</ListItemIcon>
            )}
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {user.name || 'Usuário'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 