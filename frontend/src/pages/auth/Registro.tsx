import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/styles/Auth.css';

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
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de validação e registro aqui
        if (formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        console.log(formData);
        // Após o registro bem-sucedido:
        navigate('/login');
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
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" name="nome" onChange={handleChange} required />
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
                            <label>Instituição</label>
                            <input type="text" name="instituicao" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Curso</label>
                            <input type="text" name="curso" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Período</label>
                            <select name="periodo" onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="Diurno">Diurno</option>
                                <option value="Noturno">Noturno</option>
                                <option value="Integral">Integral</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Módulo/Semestre</label>
                            <input type="text" name="semestre" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>E-mail</label>
                            <input type="email" name="email" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input type="password" name="senha" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Senha</label>
                            <input type="password" name="confirmarSenha" onChange={handleChange} required />
                        </div>
                        <button type="submit" className="auth-button">
                            Salvar
                        </button>
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