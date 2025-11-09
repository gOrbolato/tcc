import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderUser from '../components/HeaderUser';
import { Box } from '@mui/material';

const UserLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderUser />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;