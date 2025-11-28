// Importa React e o componente Outlet para renderização de rotas aninhadas.
import React from 'react';
import { Outlet } from 'react-router-dom';
// Importa o cabeçalho específico do usuário.
import HeaderUser from '../components/HeaderUser';
// Importa o componente Box do Material-UI para estruturação.
import { Box } from '@mui/material';

/**
 * @component UserLayout
 * @description Layout principal para as páginas da área do usuário logado (não-admin).
 * Define a estrutura visual comum para o dashboard do usuário, perfil, etc.
 * Inclui um cabeçalho fixo (`HeaderUser`) e uma área onde as rotas filhas
 * são renderizadas através do `Outlet`.
 */
const UserLayout: React.FC = () => {
  return (
    // O `Box` principal é um contêiner flexível que garante que o layout ocupe no mínimo a altura total da tela.
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Renderiza o cabeçalho do usuário. */}
      <HeaderUser />
      {/* A área de conteúdo principal que se expande para preencher o espaço disponível. */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* O `Outlet` do React Router renderiza aqui o componente da rota filha ativa. */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;