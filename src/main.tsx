import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './offline/registerSW';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './security/AuthContext';
import { SimulationProvider } from './simulation/SimulationContext';

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SimulationProvider>
          <App />
        </SimulationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
