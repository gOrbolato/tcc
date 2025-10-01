import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import ResetarSenha from '../pages/auth/ResetarSenha'; // 1. Importe o novo componente

// ... outras importações

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      
      {/* 2. Adicione a nova rota com o parâmetro :token */}
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} /> 

      {/* ... outras rotas */}
    </Routes>
  );
};

export default AppRoutes;