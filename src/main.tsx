import '@fontsource-variable/inter';
import './styles/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMocksIfNeeded } from '@/lib/mock-mode';
import { App } from './App';

async function bootstrap() {
  // Decide between the real API and the in-browser mock before the first request.
  await enableMocksIfNeeded();

  const container = document.getElementById('root');
  if (!container) throw new Error('Root element #root not found');

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
