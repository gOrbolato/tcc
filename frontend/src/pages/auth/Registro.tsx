import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import '../../assets/styles/Auth.css';

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    ra: '',
    idade: '',
    instituicao_id: 1, // Assumindo ID 1 como padrão
    curso_id: 1,       // Assumindo ID 1 como padrão
    periodo: '',
    semestre: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      showNotification('As senhas não coincidem!', 'error');
      return;
    }
    try {
      const { confirmarSenha, ...dataToSubmit } = formData;
      await api.post('/auth/register', dataToSubmit);
      showNotification('Registro realizado com sucesso! Faça o login.', 'success');
      navigate('/login');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro no registro.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <Link to="/" className="auth-logo">
          Avaliação Educacional
        </Link>
      </div>
      <div className="auth-main">
        <div className="auth-form-container">
          <h2>Cadastro</h2>
          <form onSubmit={handleSubmit}>
            {/* Adicione os inputs para todos os campos do formData */}
            <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" name="nome" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>E-mail</label>
                <input type="email" name="email" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>CPF</label>
                <input type="text" name="cpf" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>RA</label>
                <input type="text" name="ra" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Idade</label>
                <input type="number" name="idade" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Senha</label>
                <input type="password" name="senha" onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Confirmar Senha</label>
                <input type="password" name="confirmarSenha" onChange={handleChange} required />
            </div>
            <button type="submit" className="auth-button">Salvar</button>
          </form>
          <div className="auth-links">
            <Link to="/login">Já tem uma conta? Faça login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;