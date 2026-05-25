import './bootstrap';
import '../css/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';

const rootEl = document.getElementById('root');

if (!rootEl) {
    console.error('No se encontró #root para montar React.');
} else {
    createRoot(rootEl).render(
        <StrictMode>
            <AppRouter />
        </StrictMode>,
    );
}
