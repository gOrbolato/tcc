import React, { useState } from 'react';
import '../../assets/styles/Auth.css';

const Perfil: React.FC = () => {
    const [formData, setFormData] = useState({
        instituicao: 'Instituição Atual',
        curso: 'Curso Atual',
        periodo: 'Diurno',
        semestre: '4º',
        senha: '',
        confirmarSenha: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para atualizar o perfil
        console.log('Perfil atualizado:', formData);
    };

    return (
        <div className="auth-main" style={{ width: '100%' }}>
            <div className="auth-form-container">
                <h2>Meu Perfil</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Instituição</label>
                        <input type="text" name="instituicao" value={formData.instituicao} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Curso</label>
                        <input type="text" name="curso" value={formData.curso} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Período</label>
                        <select name="periodo" value={formData.periodo} onChange={handleChange}>
                            <option value="Diurno">Diurno</option>
                            <option value="Noturno">Noturno</option>
                            <option value="Integral">Integral</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Módulo/Semestre</label>
                        <input type="text" name="semestre" value={formData.semestre} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Nova Senha</label>
                        <input type="password" name="senha" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Nova Senha</label>
                        <input type="password" name="confirmarSenha" onChange={handleChange} />
                    </div>
                    <button type="submit" className="auth-button">
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Perfil;