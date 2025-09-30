import React, { useState } from 'react';
import '../../assets/styles/Dashboard.css';

const Avaliacao: React.FC = () => {
    const [perguntas, setPerguntas] = useState([
        // Perguntas sobre a Instituição
        { id: 1, categoria: 'Instituição', texto: 'Como você avalia a infraestrutura geral (salas de aula, laboratórios, etc.)?', nota: 0, obs: '' },
        { id: 2, categoria: 'Instituição', texto: 'A coordenação do seu curso é acessível e prestativa?', nota: 0, obs: '' },
        { id: 3, categoria: 'Instituição', texto: 'Como você avalia o atendimento da secretaria acadêmica?', nota: 0, obs: '' },
        { id: 4, categoria: 'Instituição', texto: 'O acervo da biblioteca (físico e digital) atende às suas necessidades?', nota: 0, obs: '' },
        { id: 5, categoria: 'Instituição', texto: 'Os equipamentos disponíveis (computadores, projetores, etc.) são modernos e funcionais?', nota: 0, obs: '' },
        { id: 6, categoria: 'Instituição', texto: 'A instituição oferece boas opções de cursos de extensão e atividades extracurriculares?', nota: 0, obs: '' },
        { id: 7, categoria: 'Instituição', texto: 'Qual a sua percepção sobre a influência e a imagem da instituição na comunidade?', nota: 0, obs: '' },
        { id: 8, categoria: 'Instituição', texto: 'A instituição te auxilia na busca por estágios e oportunidades no mercado de trabalho?', nota: 0, obs: '' },

        // Perguntas sobre o Curso
        { id: 9, categoria: 'Curso', texto: 'O material didático fornecido pelos professores é de qualidade e atualizado?', nota: 0, obs: '' },
        { id: 10, categoria: 'Curso', texto: 'Os professores demonstram domínio do conteúdo e estão disponíveis para tirar dúvidas?', nota: 0, obs: '' },
        { id: 11, categoria: 'Curso', texto: 'A metodologia de ensino utilizada pelos professores é eficaz e estimulante?', nota: 0, obs: '' },
        { id: 12, categoria: 'Curso', texto: 'O conteúdo abordado nas disciplinas está alinhado com as demandas do mercado de trabalho?', nota: 0, obs: '' },
        { id: 13, categoria: 'Curso', texto: 'As avaliações aplicadas são justas e condizentes com o que foi ensinado?', nota: 0, obs: '' },
    ]);

    const handleNotaChange = (id: number, nota: number) => {
        setPerguntas(perguntas.map(p => p.id === id ? { ...p, nota } : p));
    };

    const handleObsChange = (id: number, obs: string) => {
        setPerguntas(perguntas.map(p => p.id === id ? { ...p, obs } : p));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para calcular as médias e salvar a avaliação
        const notasInstituicao = perguntas.filter(p => p.categoria === 'Instituição').map(p => p.nota);
        const mediaInstituicao = notasInstituicao.reduce((a, b) => a + b, 0) / notasInstituicao.length;

        const notasCurso = perguntas.filter(p => p.categoria === 'Curso').map(p => p.nota);
        const mediaCurso = notasCurso.reduce((a, b) => a + b, 0) / notasCurso.length;

        const mediaFinal = (mediaInstituicao + mediaCurso) / 2;

        console.log('Média Instituição:', mediaInstituicao.toFixed(2));
        console.log('Média Curso:', mediaCurso.toFixed(2));
        console.log('Média Final:', mediaFinal.toFixed(2));
        console.log('Respostas:', perguntas);
        
        alert('Avaliação enviada com sucesso!');
    };

    return (
        <div className="avaliacao-container">
            <h2>Página de Avaliação</h2>
            <form onSubmit={handleSubmit}>
                <h2>Avaliação da Instituição</h2>
                {perguntas.filter(p => p.categoria === 'Instituição').map(pergunta => (
                    <div key={pergunta.id} className="pergunta-card">
                        <h3>{pergunta.texto}</h3>
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map(valor => (
                                <span
                                    key={valor}
                                    className={pergunta.nota >= valor ? 'star-filled' : 'star-empty'}
                                    onClick={() => handleNotaChange(pergunta.id, valor)}
                                >
                                    &#9733;
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder="Observações..."
                            value={pergunta.obs}
                            onChange={(e) => handleObsChange(pergunta.id, e.target.value)}
                        />
                    </div>
                ))}

                <h2>Avaliação do Curso</h2>
                {perguntas.filter(p => p.categoria === 'Curso').map(pergunta => (
                    <div key={pergunta.id} className="pergunta-card">
                        <h3>{pergunta.texto}</h3>
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map(valor => (
                                <span
                                    key={valor}
                                    className={pergunta.nota >= valor ? 'star-filled' : 'star-empty'}
                                    onClick={() => handleNotaChange(pergunta.id, valor)}
                                >
                                    &#9733;
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder="Observações..."
                            value={pergunta.obs}
                            onChange={(e) => handleObsChange(pergunta.id, e.target.value)}
                        />
                    </div>
                ))}
                <button type="submit" className="avaliacao-button">Salvar Avaliação</button>
            </form>
        </div>
    );
};

export default Avaliacao;