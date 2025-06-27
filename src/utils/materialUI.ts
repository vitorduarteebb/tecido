// Importações globais do Material-UI para resolver problemas de build
import React from 'react';
import DialogContentText from '@mui/material/DialogContentText';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

// Exporta os componentes para garantir que sejam incluídos no bundle
export {
  DialogContentText,
  DialogContent,
  DialogTitle,
  DialogActions,
  Dialog
};

// Função para garantir que os componentes estejam disponíveis
const ensureGlobalComponents = () => {
  if (typeof window !== 'undefined') {
    // Adiciona ao objeto window globalmente
    (window as any).DialogContentText = DialogContentText;
    (window as any).DialogContent = DialogContent;
    (window as any).DialogTitle = DialogTitle;
    (window as any).DialogActions = DialogActions;
    (window as any).Dialog = Dialog;
    
    // Também adiciona ao objeto global para compatibilidade
    (globalThis as any).DialogContentText = DialogContentText;
    (globalThis as any).DialogContent = DialogContent;
    (globalThis as any).DialogTitle = DialogTitle;
    (globalThis as any).DialogActions = DialogActions;
    (globalThis as any).Dialog = Dialog;
    
    console.log('✅ Componentes Material-UI carregados globalmente:', {
      DialogContentText: !!DialogContentText,
      DialogContent: !!DialogContent,
      DialogTitle: !!DialogTitle,
      DialogActions: !!DialogActions,
      Dialog: !!Dialog
    });
  }
};

// Executa imediatamente
ensureGlobalComponents();

// Também executa quando o DOM estiver pronto
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureGlobalComponents);
  } else {
    ensureGlobalComponents();
  }
  
  // Executa também no próximo tick para garantir
  setTimeout(ensureGlobalComponents, 0);
  setTimeout(ensureGlobalComponents, 100);
  setTimeout(ensureGlobalComponents, 500);
}

// Proxy para capturar tentativas de acesso a DialogContentText
if (typeof window !== 'undefined') {
  if (!(window as any).DialogContentText) {
    Object.defineProperty(window, 'DialogContentText', {
      get: function() {
        console.warn('DialogContentText acessado via proxy - carregando...');
        return DialogContentText;
      },
      configurable: true
    });
  }
}

// Polyfill de emergência - se tudo falhar, cria um componente básico
if (typeof window !== 'undefined' && !(window as any).DialogContentText) {
  console.warn('⚠️ Criando polyfill de emergência para DialogContentText');
  
  // Cria um componente básico de fallback
  const FallbackDialogContentText = ({ children, ...props }: any) => {
    return React.createElement('div', { 
      ...props, 
      style: { 
        padding: '16px', 
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: '1rem',
        lineHeight: 1.5,
        ...props.style 
      } 
    }, children);
  };
  
  (window as any).DialogContentText = FallbackDialogContentText;
  (globalThis as any).DialogContentText = FallbackDialogContentText;
  
  console.log('✅ Polyfill de emergência criado para DialogContentText');
} 