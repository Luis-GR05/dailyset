import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se encontró el elemento root. Revisa tu index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
    <App />

    </ThemeProvider>
  </React.StrictMode>
);