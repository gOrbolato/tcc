// Importa React e o componente Outlet para renderização de rotas aninhadas.
import React from 'react';
import { Outlet } from 'react-router-dom';
// Importa o cabeçalho específico do administrador.
import HeaderAdmin from '../components/HeaderAdmin';
// Importa o componente Box do Material-UI para estruturação.
import { Box } from '@mui/material';

/**
 * @component AdminLayout
 * @description Layout principal para as páginas da área administrativa.
 * Este componente define a estrutura visual que envolve todas as páginas de administração,
 * incluindo um cabeçalho fixo (`HeaderAdmin`) e uma área de conteúdo principal onde
 * as rotas filhas (aninhadas) serão renderizadas através do componente `Outlet`.
 */
const AdminLayout: React.FC = () => {
  return (
    // O `Box` principal é configurado como um contêiner flexível que ocupa a altura total da tela.
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Renderiza o cabeçalho administrativo no topo da página. */}
      <HeaderAdmin />
      {/* A área de conteúdo principal, que cresce para preencher o espaço disponível. */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* O `Outlet` é um placeholder onde o React Router renderizará o componente
            da rota filha correspondente à URL atual. */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;