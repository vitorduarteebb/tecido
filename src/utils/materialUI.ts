// Importações globais do Material-UI para resolver problemas de build
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

// Garante que os componentes estejam disponíveis globalmente
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