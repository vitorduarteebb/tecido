import { Component, ErrorInfo, ReactNode } from 'react';
import { debugLogger } from '../utils/debug';

interface Props {
  children: ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class DebugWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLogger.error(`Erro capturado no componente ${this.props.componentName}`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      componentName: this.props.componentName,
      timestamp: new Date().toISOString()
    });
  }

  componentDidMount() {
    debugLogger.info(`Componente ${this.props.componentName} montado`, {
      componentName: this.props.componentName,
      timestamp: new Date().toISOString()
    });

    // Verifica componentes Material-UI disponíveis
    setTimeout(() => {
      const { checkMaterialUIComponents } = require('../utils/debug');
      checkMaterialUIComponents();
    }, 100);
  }

  componentWillUnmount() {
    debugLogger.info(`Componente ${this.props.componentName} desmontado`, {
      componentName: this.props.componentName,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          border: '2px solid red', 
          backgroundColor: '#fff5f5',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: 'red', marginBottom: '10px' }}>
            Erro no Componente: {this.props.componentName}
          </h2>
          <details style={{ marginBottom: '10px' }}>
            <summary>Detalhes do Erro</summary>
            <pre style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <details>
            <summary>Stack Trace</summary>
            <pre style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugWrapper; 