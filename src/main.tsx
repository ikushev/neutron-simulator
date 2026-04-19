import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SimProvider } from './context/SimContext';
import { SettingsProvider } from './context/SettingsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <SimProvider>
        <App />
      </SimProvider>
    </SettingsProvider>
  </StrictMode>,
);
