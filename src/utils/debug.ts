// Sistema de debug avançado para capturar erros
class DebugLogger {
  private static instance: DebugLogger;
  private logs: Array<{ timestamp: string; level: string; message: string; data?: any }> = [];

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(level: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // Log no console com cores
    const colors = {
      error: '#ff0000',
      warn: '#ffa500',
      info: '#0000ff',
      debug: '#008000'
    };
    
    console.log(
      `%c[${level.toUpperCase()}] ${message}`,
      `color: ${colors[level as keyof typeof colors] || '#000000'}; font-weight: bold;`
    );
    
    if (data) {
      console.log(data);
    }
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  getLogs() {
    return this.logs;
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const debugLogger = DebugLogger.getInstance();

// Captura global de erros
export const setupGlobalErrorHandling = () => {
  // Captura erros não tratados
  window.addEventListener('error', (event) => {
    debugLogger.error('Erro global capturado', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Captura promessas rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    debugLogger.error('Promise rejeitada não tratada', {
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
  });

  // Captura erros de React
  const originalConsoleError = console.error;
  console.error = (...args) => {
    debugLogger.error('Console.error chamado', {
      args,
      stack: new Error().stack,
      timestamp: new Date().toISOString()
    });
    originalConsoleError.apply(console, args);
  };

  debugLogger.info('Sistema de debug global configurado');
};

// Verificação de componentes Material-UI
export const checkMaterialUIComponents = () => {
  const components = [
    'DialogContentText',
    'DialogContent',
    'DialogTitle',
    'DialogActions',
    'Dialog',
    'Button',
    'TextField',
    'Table',
    'TableBody',
    'TableCell',
    'TableContainer',
    'TableHead',
    'TableRow'
  ];

  const missingComponents: string[] = [];
  const availableComponents: string[] = [];

  components.forEach(componentName => {
    try {
      // Tenta acessar o componente globalmente
      const component = (window as any)[componentName];
      if (component) {
        availableComponents.push(componentName);
      } else {
        missingComponents.push(componentName);
      }
    } catch (error) {
      missingComponents.push(componentName);
    }
  });

  debugLogger.info('Verificação de componentes Material-UI', {
    available: availableComponents,
    missing: missingComponents,
    total: components.length
  });

  return { availableComponents, missingComponents };
};

// Monitor de performance
export const setupPerformanceMonitoring = () => {
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          debugLogger.info('Performance de navegação', {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstPaint: navEntry.responseStart - navEntry.requestStart
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
  }
};

// Debug de rotas
export const setupRouteDebugging = () => {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    debugLogger.info('Navegação pushState', { args });
    return originalPushState.apply(history, args);
  };

  history.replaceState = function(...args) {
    debugLogger.info('Navegação replaceState', { args });
    return originalReplaceState.apply(history, args);
  };

  window.addEventListener('popstate', (event) => {
    debugLogger.info('Navegação popstate', { 
      state: event.state,
      currentPath: window.location.pathname 
    });
  });
}; 