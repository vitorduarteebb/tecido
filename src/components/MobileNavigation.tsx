import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  People,
  Inventory,
  Receipt,
} from '@mui/icons-material';

interface MobileNavigationProps {
  userRole: string;
  pedidosPendentes?: number;
  orcamentosPendentes?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  userRole,
  pedidosPendentes = 0,
  orcamentosPendentes = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  const getNavigationItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
          { label: 'Produtos', icon: <Inventory />, path: '/admin/produtos' },
          { label: 'Clientes', icon: <People />, path: '/admin/clientes' },
          { label: 'Pedidos', icon: <ShoppingCart />, path: '/admin/pedidos' },
        ];
      case 'representante':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/representante' },
          { label: 'Produtos', icon: <Inventory />, path: '/catalogo' },
          { 
            label: 'Pedidos', 
            icon: <ShoppingCart />, 
            path: '/representante/pedidos',
            badge: pedidosPendentes
          },
          { 
            label: 'Orçamentos', 
            icon: <Receipt />, 
            path: '/representante/orcamentos',
            badge: orcamentosPendentes
          },
        ];
      case 'cliente':
        return [
          { label: 'Pedidos', icon: <ShoppingCart />, path: '/cliente/pedidos' },
          { label: 'Catálogo', icon: <Inventory />, path: '/cliente/catalogo' },
          { label: 'Notas', icon: <Receipt />, path: '/cliente/notas-fiscais' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    const item = navigationItems[newValue];
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={8}
    >
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={handleChange}
        showLabels
        sx={{
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={
              item.badge && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error" max={99}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              '& .MuiBottomNavigationAction-icon': {
                fontSize: '1.5rem',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation; 