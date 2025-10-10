import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Home.css';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Importa a instância do axios
import guilhermeOrbolatoFoto from '../assets/images/guilhermeOrbolato.jpg'; 

interface Institution {
  id: number;
  nome: string;
  nota_geral?: number;
}

interface Course {
  id: number;
  nome: string;
  nota_geral?: number;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = async (e: React.FormEvent) => {
    console.log("DEBUG Home: handleSearchSubmit acionado.");
    e.preventDefault();
    if (!searchTerm.trim()) {
      console.log("DEBUG Home: Termo de busca vazio.");
      return;
    }

    setLoading(true);
    setSelectedInstitution(null); // Limpa a seleção anterior
    setCourses([]); // Limpa os cursos anteriores
    console.log("DEBUG Home: Iniciando busca por:", searchTerm);
    try {
      const response = await api.get(`/institutions?nome=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(response.data);
      console.log("DEBUG Home: Resultados da busca:", response.data);
    } catch (error) {
      console.error("ERRO Home: Erro ao buscar instituições:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      console.log("DEBUG Home: Busca finalizada, loading false.");
    }
  };

  const handleViewCourses = async (institution: Institution) => {
    setLoading(true);
    console.log("DEBUG Home: Buscando cursos para instituição:", institution.nome);
    try {
      const response = await api.get(`/institutions/${institution.id}/courses`);
      setSelectedInstitution(institution);
      setCourses(response.data);
      console.log("DEBUG Home: Cursos encontrados:", response.data);
    } catch (error) {
      console.error("ERRO Home: Erro ao buscar cursos:", error);
      setCourses([]);
    } finally {
      setLoading(false);
      console.log("DEBUG Home: Busca de cursos finalizada, loading false.");
    }
  };

  const handleBackToInstitutions = () => {
    setSelectedInstitution(null);
    setCourses([]);
    console.log("DEBUG Home: Voltando para lista de instituições.");
  };

  console.log("DEBUG Home: Renderizando. loading:", loading, "searchResults.length:", searchResults.length, "selectedInstitution:", selectedInstitution);

  return (
    <main>
      <section className="hero">
        <h1>Consulte e Transforme a Educação</h1>
        <p>Pesquise por instituição, curso ou cidade para ver avaliações. Se é aluno, contribua de forma anônima para a melhoria do seu ensino.</p>
        
        <div className="search-container">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Digite o nome da instituição, curso ou cidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>
          </form>
        </div>
      </section>

      {loading ? (
        <section className="home-section"><div className="section-content"><p>Carregando...</p></div></section>
      ) : (
        <section className="home-section">
          <div className="section-content">
            {selectedInstitution ? (
              // Visão de Cursos da Instituição Selecionada
              <div className="institution-details">
                <button onClick={handleBackToInstitutions} className="btn btn-secondary" style={{marginBottom: '1rem'}}>← Voltar para Instituições</button>
                <h2>Cursos de {selectedInstitution.nome}</h2>
                <p>Média Geral da Instituição: <strong>{selectedInstitution.nota_geral?.toFixed(2) || 'N/A'}</strong></p>
                {courses.length > 0 ? (
                  <div className="course-list">
                    {courses.map(course => (
                      <div key={course.id} className="course-item card">
                        <h3>{course.nome}</h3>
                        <p>Média do Curso: <strong>{course.nota_geral?.toFixed(2) || 'N/A'}</strong></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhum curso encontrado para esta instituição.</p>
                )}
              </div>
            ) : searchResults.length > 0 ? (
              // Visão de Resultados da Busca de Instituições
              <div className="institution-results">
                <h2>Resultados da Busca por "{searchTerm}"</h2>
                <div className="institution-list">
                  {searchResults.map(institution => (
                    <div key={institution.id} className="institution-item card">
                      <h3>{institution.nome}</h3>
                      <p>Média Geral: <strong>{Number(institution.nota_geral)?.toFixed(2) || 'N/A'}</strong></p>
                      <button onClick={() => handleViewCourses(institution)} className="btn btn-primary">Ver Cursos</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm.trim() ? (
              <p>Nenhuma instituição encontrada para "{searchTerm}".</p>
            ) : (
              <p>Use a barra de busca para encontrar instituições.</p>
            )}
          </div>
        </section>
      )}

      <section className="home-section how-it-works">
        <div className="section-content">
          <h2>Como Funciona?</h2>
          <div className="steps">
            <div className="step">
              <h3>1. Pesquisa Aberta</h3>
              <p>Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.</p>
            </div>
            <div className="step">
              <h3>2. Avaliação Anônima</h3>
              <p>Para contribuir, crie sua conta e responda aos questionários. Sua identidade é sempre preservada para que você se expresse livremente.</p>
            </div>
            <div className="step">
              <h3>3. Análise e Melhorias</h3>
              <p>As avaliações são compiladas e analisadas pela administração para identificar pontos de melhoria e implementar mudanças efetivas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section about-platform">
        <div className="section-content">
          <div className="about-content">
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" alt="Estudantes colaborando" />
            </div>
            <div className="about-text">
              <h2>Sobre a Plataforma</h2>
              <p>
                O Sistema de Avaliação Educacional é uma ferramenta desenvolvida para fortalecer a comunicação entre alunos e instituições de ensino. 
                Acreditamos que o feedback construtivo é a chave para aprimorar a qualidade da infraestrutura, do material didático e da experiência acadêmica como um todo. 
                Nossa plataforma garante um processo de avaliação seguro, anônimo e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

        <section className="home-section developers">
        <div className="section-content">
          <h2>Desenvolvedores</h2>
          <div className="developer-card">
            {/* 2. Use a variável da foto importada aqui */}
            <img 
              src={guilhermeOrbolatoFoto} 
              alt="Foto de Guilherme Orbolato" 
              className="developer-photo" 
            />
            <div className="developer-info">
              <h3>Guilherme Orbolato</h3>
              <span>Desenvolvedor Full Stack</span>
              <p>
                Responsável pela concepção, desenvolvimento e implementação de todas as funcionalidades do sistema, 
                desde o backend e banco de dados até a interface do usuário no frontend.
                </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section project-presentation">
        <div className="section-content">
          <h2>Apresentação do Projeto</h2>
          <p>
            Este sistema é o resultado de um Trabalho de Conclusão de Curso (TCC) dedicado a aprimorar a comunicação e o feedback no ambiente educacional.
            O objetivo foi desenvolver uma ferramenta robusta, segura e de fácil utilização para alunos e administradores, 
            promovendo um ciclo de melhoria contínua nas instituições de ensino.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;
