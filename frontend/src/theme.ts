
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Função auxiliar para criar um tema base com opções comuns
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
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Bordas mais arredondadas
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: `0 4px 14px 0 ${palette.primary.main}40`, // Sombra sutil com a cor primária
          '&:hover': {
            boxShadow: `0 6px 20px 0 ${palette.primary.main}50`,
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Sombra suave para o header
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12, // Consistent with global shape.borderRadius
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', // Subtle shadow for depth
          padding: '16px', // Internal padding for content
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 24px 8px', // Adjust padding
          fontSize: '1.5rem', // Larger title
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px', // Adjust padding
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px', // Adjust padding
          justifyContent: 'flex-end', // Align buttons to the right
          '& > :not(:first-of-type)': {
            marginLeft: '8px', // Space between buttons
          },
        },
      },
    },
  },
}));

// --- Paleta Aluno (Roxo) ---
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
    default: '#F8F9FA', // Tom pastel de fundo
    paper: '#FFFFFF',   // Cards e papéis brancos
  },
  text: {
    primary: '#212529',
    secondary: '#6c757d',
  },
};

// --- Paleta Admin (Verde) ---
const adminPalette = {
  mode: 'light' as const,
  primary: {
    main: '#2E7D32', // Verde
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#0288d1', // Azul mais escuro
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

// Cria os temas completos
export const alunoTheme = createBaseTheme(alunoPalette);
export const adminTheme = createBaseTheme(adminPalette);

// O tema do aluno é o padrão
export const defaultTheme = alunoTheme;
