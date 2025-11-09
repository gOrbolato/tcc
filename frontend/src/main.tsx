import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SelectionProvider } from './contexts/SelectionContext';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from 'notistack';

// Imports para o Date Picker
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <BrowserRouter>
          <SelectionProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </SelectionProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </LocalizationProvider>
  </React.StrictMode>
);