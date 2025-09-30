import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/Auth.css';

const RecuperarSenha: React.FC = () => {
    const [step, setStep] = useState(1);
    const [cpf, setCpf] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para enviar o código para o e-mail vinculado ao CPF
        setStep(2);
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para verificar o código
        setStep(3);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        // Lógica para redefinir a senha
        alert('Senha redefinida com sucesso!');
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
                    <h2>Recuperar Senha</h2>
                    {step === 1 && (
                        <form onSubmit={handleSendCode}>
                            <div className="form-group">
                                <label htmlFor="cpf">CPF</label>
                                <input
                                    type="text"
                                    id="cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-button">
                                Enviar Código
                            </button>
                        </form>
                    )}
                    {step === 2 && (
                        <form onSubmit={handleVerifyCode}>
                            <div className="form-group">
                                <label htmlFor="code">Código de Verificação</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-button">
                                Verificar Código
                            </button>
                        </form>
                    )}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>Nova Senha</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-button">
                                Redefinir Senha
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecuperarSenha;