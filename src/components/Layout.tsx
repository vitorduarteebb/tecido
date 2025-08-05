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
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
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
  AccountCircle,
  Notifications,
  CloudUpload,
} from '@mui/icons-material';
import { RootState } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { pedidoService } from '../services/pedidoService';
import { orcamentoService } from '../services/orcamentoService';
import MobileNavigation from './MobileNavigation';

const drawerWidth = 280;

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

const menuItems: MenuItems = {
  admin: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Produtos', icon: <Inventory />, path: '/admin/produtos' },
    { text: 'Representantes', icon: <GroupIcon />, path: '/admin/representantes' },
    { text: 'Clientes', icon: <People />, path: '/admin/clientes' },
    { text: 'Pedidos', icon: <ShoppingCart />, path: '/admin/pedidos' },
    { text: 'Importação', icon: <CloudUpload />, path: '/admin/importacao' },
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
    { text: 'Catálogo', icon: <Inventory />, path: '/cliente/catalogo' },
  ],
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [orcamentosPendentes, setOrcamentosPendentes] = useState(0);

  const getUserRole = (role: User['role']): RoleKey => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'admin';
      case 'REPRESENTANTE':
        return 'representante';
      case 'CLIENTE':
        return 'cliente';
      default:
        return 'cliente';
    }
  };

  const userRole = getUserRole(user?.role || 'CLIENTE');

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getUser();

        if (!token || !savedUser) {
          dispatch(logout());
          return;
        }

        if (!isAuthenticated) {
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
        setOrcamentosPendentes(orcamentos.filter((o: any) => o.status === 'pendente').length);
      });
    }
  }, [userRole, user]);

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
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/login');
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Avatar sx={{ 
          width: 64, 
          height: 64, 
          mb: 1,
          backgroundColor: 'primary.dark'
        }}>
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" noWrap>
          {user.name || 'Usuário'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user.role}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems[userRole].map((item: MenuItem) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {item.text === 'Solicitações de Orçamento' ? (
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Badge badgeContent={orcamentosPendentes} color="error" invisible={orcamentosPendentes === 0}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
            ) : item.text === 'Meus Pedidos' ? (
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Badge badgeContent={pedidosPendentes} color="error" invisible={pedidosPendentes === 0}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
            ) : (
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            )}
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: isSmallMobile ? '0.875rem' : '1rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider />
      <List>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            mx: 1,
            mb: 1,
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText 
            primary="Sair" 
            primaryTypographyProps={{
              fontSize: isSmallMobile ? '0.875rem' : '1rem',
              fontWeight: 500,
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 1, sm: 2 }
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Loja de Tecidos
          </Typography>

          {(pedidosPendentes > 0 || orcamentosPendentes > 0) && (
            <Tooltip title="Notificações">
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge 
                  badgeContent={pedidosPendentes + orcamentosPendentes} 
                  color="error"
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Perfil">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user.name} ({user.role})
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.1)',
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
          p: { xs: 1, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' },
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
          pb: isMobile ? '80px' : 0,
        }}
      >
        <Outlet />
      </Box>

      <MobileNavigation
        userRole={userRole}
        pedidosPendentes={pedidosPendentes}
        orcamentosPendentes={orcamentosPendentes}
      />
    </Box>
  );
};

export default Layout; 