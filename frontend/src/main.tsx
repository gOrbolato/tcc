// Importa as bibliotecas principais do React e ReactDOM.
import React from 'react';
import ReactDOM from 'react-dom/client';
// Importa o BrowserRouter para gerenciar as rotas da aplicação.
import { BrowserRouter } from 'react-router-dom';
// Importa o componente principal da aplicação.
import App from './App';
// Importa os provedores de contexto para compartilhar estado entre os componentes.
import { SelectionProvider } from './contexts/SelectionContext';
import { AuthProvider } from './contexts/AuthContext';
// Importa o provedor de Snackbar para exibir notificações.
import { SnackbarProvider } from 'notistack';

// Importa os componentes necessários para o Date Picker do Material-UI.
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// Importa a localização em português para o Day.js.
import 'dayjs/locale/pt-br';

// Importa as fontes Roboto utilizadas pelo Material-UI.
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Renderiza a aplicação na DOM.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // O StrictMode ajuda a identificar potenciais problemas na aplicação.
  <React.StrictMode>
    {/* Provedor de localização para os componentes de data/hora do Material-UI. */}
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      {/* Provedor de Snackbar para notificações em toda a aplicação. */}
      <SnackbarProvider 
        maxSnack={3} // Número máximo de notificações visíveis ao mesmo tempo.
        autoHideDuration={3000} // Duração em que a notificação fica visível.
        anchorOrigin={{ // Posição das notificações na tela.
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Habilita o roteamento da aplicação. */}
        <BrowserRouter>
          {/* Provedor para o contexto de seleção de instituição/curso. */}
          <SelectionProvider>
            {/* Provedor para o contexto de autenticação do usuário. */}
            <AuthProvider>
              {/* Componente principal da aplicação. */}
              <App />
            </AuthProvider>
          </SelectionProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </LocalizationProvider>
  </React.StrictMode>
);