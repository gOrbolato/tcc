import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import RecuperarSenha from '../pages/RecuperarSenha';
import Dashboard from '../pages/Dashboard';
import Perfil from '../pages/Perfil';
import Avaliacao from '../pages/Avaliacao';
import AdminDashboard from '../pages/AdminDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/recuperar-senha',
    element: <RecuperarSenha />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/perfil',
    element: <Perfil />,
  },
  {
    path: '/avaliacao',
    element: <Avaliacao />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
]);

export default router;
