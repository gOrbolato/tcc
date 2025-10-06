import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Dashboard.css';

const Avaliacao: React.FC = () => {
    const [notaInfra, setNotaInfra] = useState(0);
    const [obsInfra, setObsInfra] = useState('');
    const [notaMaterial, setNotaMaterial] = useState(0);
    const [obsMaterial, setObsMaterial] = useState('');
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // OBS: Em um app real, o usuário selecionaria a instituição/curso.
            // Aqui, estamos usando valores fixos para o exemplo.
            // Você precisará buscar os dados do usuário logado para obter isso.
            const evaluationData = {
                instituicao_id: 1, // Exemplo: Pegar do perfil do usuário
                curso_id: 1,       // Exemplo: Pegar do perfil do usuário
                nota_infraestrutura: notaInfra,
                obs_infraestrutura: obsInfra,
                nota_material_didatico: notaMaterial,
                obs_material_didatico: obsMaterial,
            };

            await api.post('/avaliacoes', evaluationData);
            showNotification('Avaliação enviada com sucesso!', 'success');
            navigate('/dashboard'); // Supondo que o dashboard do usuário seja em /dashboard
        } catch (error) {
            showNotification('Erro ao enviar avaliação.', 'error');
        }
    };

    const Rating = ({ nota, onNotaChange }: { nota: number, onNotaChange: (nota: number) => void }) => (
        <div className="rating">
            {[1, 2, 3, 4, 5].map(valor => (
                <span
                    key={valor}
                    className={nota >= valor ? 'star-filled' : 'star-empty'}
                    onClick={() => onNotaChange(valor)}
                >
                    &#9733;
                </span>
            ))}
        </div>
    );

    return (
        <div className="avaliacao-container">
            <h2>Realizar Nova Avaliação</h2>
            <form onSubmit={handleSubmit}>
                <div className="pergunta-card">
                    <h3>Como você avalia a infraestrutura geral (salas de aula, laboratórios, etc.)?</h3>
                    <Rating nota={notaInfra} onNotaChange={setNotaInfra} />
                    <textarea
                        placeholder="Observações sobre a infraestrutura..."
                        value={obsInfra}
                        onChange={(e) => setObsInfra(e.target.value)}
                    />
                </div>

                <div className="pergunta-card">
                    <h3>Como você avalia o material didático fornecido?</h3>
                    <Rating nota={notaMaterial} onNotaChange={setNotaMaterial} />
                    <textarea
                        placeholder="Observações sobre o material didático..."
                        value={obsMaterial}
                        onChange={(e) => setObsMaterial(e.target.value)}
                    />
                </div>
                <button type="submit" className="avaliacao-button">Salvar Avaliação</button>
            </form>
        </div>
    );
};

export default Avaliacao;