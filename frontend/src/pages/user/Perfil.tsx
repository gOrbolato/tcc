
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Admin.css';

// --- Interfaces ---
interface ProfileData {
  nome: string;
  email: string;
  instituicao_id: number | null;
  curso_id: number | null;
  periodo: string | null;
  ra: string;
}
interface Institution { id: number; nome: string; }
interface Course { id: number; nome: string; }
// ------------------

const Perfil: React.FC = () => {
  // --- Estados ---
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRaEnabled, setIsRaEnabled] = useState(false);
  const { showNotification } = useNotification();
  const { logout } = useAuth();
  const navigate = useNavigate();
  // ------------------

  // --- Lógica de Dados ---
  const fetchProfile = useCallback(async () => {
    setLoading(true);
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
    } catch (error) { showNotification('Erro ao carregar dados.', 'error'); }
    finally { setLoading(false); }
  }, [showNotification]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

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
      showNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error: any) { showNotification(error.response?.data?.message || 'Erro ao atualizar perfil.', 'error'); }
  };

  const handleTrancarCurso = async () => {
    if (window.confirm('Tem certeza que deseja trancar seu curso? Sua conta será desativada e você só poderá reativá-la no próximo período de rematrícula (Janeiro/Fevereiro ou Julho/Agosto).')) {
      try {
        await api.put('/perfil', { is_active: false });
        showNotification('Sua matrícula foi trancada com sucesso.', 'success');
        logout();
        navigate('/');
      } catch (error) {
        showNotification('Erro ao trancar sua matrícula.', 'error');
      }
    }
  };
  // ------------------

  if (loading || !profile) return <div className="dashboard-container"><p>Carregando perfil...</p></div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Configurações do Perfil</h1>
        <Link to="/dashboard" className="secondary-btn">Voltar ao Dashboard</Link>
      </header>

      <div className="admin-section">
        <h2>Meus Dados Acadêmicos</h2>
        <p><strong>Nome:</strong> {profile.nome}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Instituição</label>
            <select value={profile.instituicao_id || ''} onChange={(e) => handleInputChange('instituicao_id', Number(e.target.value))}>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Curso</label>
            <select value={profile.curso_id || ''} onChange={(e) => handleInputChange('curso_id', Number(e.target.value))}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Período</label>
            <select value={profile.periodo || ''} onChange={(e) => handleInputChange('periodo', e.target.value)}>
              <option>Matutino</option><option>Vespertino</option><option>Noturno</option><option>Integral</option>
            </select>
          </div>
          <div className="form-group">
            <label>RA (Registro Acadêmico)</label>
            <input type="text" value={profile.ra} onChange={(e) => handleInputChange('ra', e.target.value)} disabled={!isRaEnabled} />
            {!isRaEnabled && <p style={{fontSize: '0.8rem', color: '#666'}}>O RA só pode ser alterado se você mudar de instituição e de curso.</p>}
          </div>
          <button type="submit" className="new-evaluation-btn">Salvar Alterações</button>
        </form>
      </div>

      <div className="admin-section" style={{borderColor: '#dc3545'}}>
        <h2 style={{color: '#dc3545'}}>Zona de Perigo</h2>
        <p>A ação abaixo é irreversível e só pode ser desfeita no próximo período de rematrícula.</p>
        <button onClick={handleTrancarCurso} className="delete-btn">Trancar Curso</button>
      </div>
    </div>
  );
};

export default Perfil;
