import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/UserArea.css';

interface ProfileData {
  nome: string;
  email: string;
  instituicao_id: number | null;
  curso_id: number | null;
  periodo: string | null;
  ra: string;
  is_active: boolean;
}
interface Institution { id: number; nome: string; }
interface Course { id: number; nome: string; }

const Perfil: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRaEnabled, setIsRaEnabled] = useState(false);
  const { showNotification } = useNotification();
  const { logout, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const fetchProfileData = useCallback(async () => {
    console.log("DEBUG Perfil: fetchProfileData iniciado.");
    setPageLoading(true);
    setError(null);
    try {
      const [profileRes, instRes, courseRes] = await Promise.all([
        api.get('/perfil'),
        api.get('/institutions'),
        api.get('/courses')
      ]);
      setProfile(profileRes.data);
      setInitialProfile(profileRes.data);
      setInstitutions(instRes.data);
      setCourses(courseRes.data);
      console.log("DEBUG Perfil: Dados carregados. Profile:", profileRes.data, "Institutions:", instRes.data, "Courses:", courseRes.data);
    } catch (err) {
      console.error("ERRO Perfil: Erro ao carregar dados do perfil.", err);
      showNotification('Erro ao carregar dados do perfil.', 'error');
      setError('Não foi possível carregar seus dados. Tente novamente mais tarde.');
    } finally {
      setPageLoading(false);
      console.log("DEBUG Perfil: fetchProfileData finalizado, pageLoading false.");
    }
  }, [showNotification]);

  useEffect(() => {
    console.log("DEBUG Perfil: useEffect executado. isAuthLoading:", isAuthLoading, "user:", user);
    if (isAuthLoading) return; // Espera a autenticação carregar

    if (user) {
      fetchProfileData();
    } else {
      console.log("DEBUG Perfil: Usuário não logado, setando pageLoading para false.");
      setPageLoading(false);
      navigate('/login'); // Redireciona para login se não houver usuário
    }
  }, [isAuthLoading, user, fetchProfileData, navigate]);

  useEffect(() => {
    if (profile && initialProfile) {
      const instChanged = profile.instituicao_id !== initialProfile.instituicao_id;
      const courseChanged = profile.curso_id !== initialProfile.curso_id;
      setIsRaEnabled(instChanged && courseChanged);
    }
  }, [profile, initialProfile]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const response = await api.put('/perfil', {
        instituicao_id: profile.instituicao_id,
        curso_id: profile.curso_id,
        periodo: profile.periodo,
        ra: isRaEnabled ? profile.ra : undefined,
      });
      setInitialProfile(response.data);
      setProfile(response.data);
      showNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error: any) { 
      console.error("ERRO Perfil: Erro ao atualizar perfil.", error);
      showNotification(error.response?.data?.message || 'Erro ao atualizar perfil.', 'error'); 
    }
  };

  const handleTrancarCurso = async () => {
    if (window.confirm('Tem certeza que deseja trancar seu curso? Sua conta será desativada e você só poderá reativá-la no próximo período de rematrícula (Janeiro/Fevereiro ou Julho/Agosto).')) {
      try {
        await api.put('/perfil', { is_active: false });
        showNotification('Sua matrícula foi trancada com sucesso.', 'success');
        logout();
        navigate('/');
      } catch (error) { 
        console.error("ERRO Perfil: Erro ao trancar matrícula.", error);
        showNotification('Erro ao trancar sua matrícula.', 'error'); 
      }
    }
  };

  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  if (error) return <section className="page-section"><div className="section-content"><p style={{color: 'red'}}>{error}</p></div></section>;
  if (!profile) return <section className="page-section"><div className="section-content"><p>Não foi possível encontrar o perfil.</p></div></section>;

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Configurações do Perfil</h1>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">Voltar ao Dashboard</Link>
        </div>
        <div className="card">
          <h2>Meus Dados Acadêmicos</h2>
          {!profile.is_active && (
            <div className="alert alert-warning" style={{marginBottom: '1.5rem'}}>
              <p>Sua matrícula está trancada. Para reativá-la, entre em contato com a administração.</p>
            </div>
          )}
          <p><strong>Nome:</strong> {profile.nome}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <form onSubmit={handleSubmit} style={{marginTop: '2rem'}}>
            <div className="form-group">
              <label htmlFor="instituicao">Instituição</label>
              <select id="instituicao" value={profile.instituicao_id || ''} onChange={(e) => handleInputChange('instituicao_id', Number(e.target.value))}>
                <option value="">Selecione uma instituição</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="curso">Curso</label>
              <select id="curso" value={profile.curso_id || ''} onChange={(e) => handleInputChange('curso_id', Number(e.target.value))}>
                <option value="">Selecione um curso</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="periodo">Período</label>
              <select id="periodo" value={profile.periodo || ''} onChange={(e) => handleInputChange('periodo', e.target.value)}>
                <option value="">Selecione um período</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ra">RA (Registro Acadêmico)</label>
              <input id="ra" type="text" value={profile.ra} onChange={(e) => handleInputChange('ra', e.target.value)} disabled={!isRaEnabled} />
              {!isRaEnabled && <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>O RA só pode ser alterado se você mudar de instituição e de curso.</p>}
            </div>
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
          </form>
        </div>

        <div className="card" style={{borderColor: '#dc3545'}}>
          <h2>Zona de Perigo</h2>
          <p>A ação abaixo é irreversível e só pode ser desfeita no próximo período de rematrícula.</p>
          <button onClick={handleTrancarCurso} className="btn btn-danger">Trancar Curso</button>
        </div>
      </div>
    </section>
  );
};

export default Perfil;
