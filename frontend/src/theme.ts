// Importa as funções `createTheme` e `responsiveFontSizes` do Material-UI.
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * @function createBaseTheme
 * @description Função auxiliar para criar um tema base com configurações comuns que podem ser compartilhadas entre diferentes paletas de cores.
 * @param {any} palette - Um objeto de paleta de cores do Material-UI.
 * @returns {Theme} - Um objeto de tema completo e com fontes responsivas.
 */
const createBaseTheme = (palette: any) => responsiveFontSizes(createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    button: {
      textTransform: 'none', // Remove a transformação de texto para maiúsculas nos botões.
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Bordas mais arredondadas para componentes como Paper e Card.
  },
  components: {
    // Estilização customizada para o componente Button.
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Remove a sombra padrão dos botões.
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: `0 4px 14px 0 ${palette.primary.main}40`, // Sombra sutil com a cor primária.
          '&:hover': {
            boxShadow: `0 6px 20px 0 ${palette.primary.main}50`,
          }
        },
      },
    },
    // Remove a imagem de fundo padrão do Paper (usado em Cards, etc.).
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    // Estilização para a barra de aplicativos (Header).
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Sombra suave para o header.
        },
      },
    },
    // Estilização customizada para caixas de diálogo (Dialogs).
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          padding: '16px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 24px 8px',
          fontSize: '1.5rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          justifyContent: 'flex-end',
          '& > :not(:first-of-type)': {
            marginLeft: '8px',
          },
        },
      },
    },
  },
}));

// --- Paleta de Cores para Aluno (Roxo) ---
const alunoPalette = {
  mode: 'light' as const,
  primary: {
    main: '#673ab7', // Roxo
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#2196f3', // Azul
  },
  background: {
    default: '#F8F9FA', // Fundo cinza claro
    paper: '#FFFFFF',   // Cor do papel (cards)
  },
  text: {
    primary: '#212529',
    secondary: '#6c757d',
  },
};

// --- Paleta de Cores para Administrador (Verde) ---
const adminPalette = {
  mode: 'light' as const,
  primary: {
    main: '#2E7D32', // Verde
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#0288d1', // Azul
  },
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#212529',
    secondary: '#6c757d',
  },
};

// Cria os temas completos usando a função base e as paletas específicas.
export const alunoTheme = createBaseTheme(alunoPalette);
export const adminTheme = createBaseTheme(adminPalette);

// Define o tema do aluno como o padrão da aplicação.
export const defaultTheme = alunoTheme;
