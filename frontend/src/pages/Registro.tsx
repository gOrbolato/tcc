import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    ra: '',
    idade: '',
    instituicao: '',
    curso: '',
    periodo: '',
    semestre: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!validatePassword(formData.senha)) {
      setError('A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.');
      return;
    }
    // Simulação de chamada de API
    try {
      // const response = await api.post('/register', formData);
      // if (response.status === 201) {
      //   navigate('/login');
      // }
      console.log('Registering with:', formData);
      navigate('/login');
    } catch (err) {
      setError('Ocorreu um erro ao tentar se cadastrar.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <Link to="/">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Cadastro</h2>
          {error && <p className="error-message">{error}</p>}
          <input type="text" name="nome" placeholder="Nome Completo" onChange={handleChange} required />
          <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} required />
          <input type="text" name="ra" placeholder="RA" onChange={handleChange} required />
          <input type="number" name="idade" placeholder="Idade" onChange={handleChange} required />
          <input type="text" name="instituicao" placeholder="Instituição" onChange={handleChange} required />
          <input type="text" name="curso" placeholder="Curso" onChange={handleChange} required />
          <select name="periodo" onChange={handleChange} required>
            <option value="">Período</option>
            <option value="diurno">Diurno</option>
            <option value="noturno">Noturno</option>
            <option value="integral">Integral</option>
          </select>
          <input type="text" name="semestre" placeholder="Módulo ou Semestre" onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required />
          <input type="password" name="senha" placeholder="Senha" onChange={handleChange} required />
          <input type="password" name="confirmarSenha" placeholder="Confirmar Senha" onChange={handleChange} required />
          <button type="submit">Salvar</button>
          <p className="auth-link">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;
