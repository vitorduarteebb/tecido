import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

type PrivateRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const hasToken = !!authService.getToken();
  const user = authService.getUser();
  const hasSavedUser = !!user;
  const userRole = user?.role?.toUpperCase();
  const isAuthenticated = hasToken && hasSavedUser;

  // Log do estado atual para debug
  console.log('PrivateRoute - Estado atual:', {
    isAuthenticated,
    userRole,
    requiredRole,
    hasToken,
    hasSavedUser
  });

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    console.log('PrivateRoute - Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não houver role requerida, permite o acesso
  if (!requiredRole) {
    console.log('PrivateRoute - Sem role requerida, permitindo acesso');
    return <>{children}</>;
  }

  // Se houver role requerida, verifica se o usuário tem a permissão necessária
  if (userRole !== requiredRole) {
    console.log(`PrivateRoute - Acesso negado: role requerida ${requiredRole}, role do usuário ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Se chegou aqui, permite o acesso
  console.log(`PrivateRoute - Renderizando conteúdo protegido para: ${userRole}`);
  return <>{children}</>;
};

export default PrivateRoute; 