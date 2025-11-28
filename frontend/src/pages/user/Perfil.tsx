// Importa React, hooks e componentes de UI.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, Typography, Card, CardContent, CardHeader, TextField, Button, Box, CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Autocomplete } from '@mui/material';

// Tipos para os dados dos dropdowns.
interface Institution { id: number; nome: string; }
interface Course { id: number; nome: string; }

/**
 * @component Perfil
 * @description Página onde o usuário pode visualizar e editar suas informações de perfil.
 * Também permite trancar o curso ou solicitar o desbloqueio.
 */
const Perfil: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Estados para os campos do formulário.
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [previsaoTermino, setPrevisaoTermino] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Estados de controle.
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isTrancado, setIsTrancado] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [motivoDesbloqueio, setMotivoDesbloqueio] = useState('');
  const [motivoTrancamento, setMotivoTrancamento] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [daysToEdit, setDaysToEdit] = useState(0);

  // Preenche o formulário e define as permissões de edição quando o usuário é carregado.
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email ?? '');
      setRa((user as any).ra || '');
      setPeriodo((user as any).periodo || '');
      setPrevisaoTermino((user as any).previsao_termino || '');
      setIsTrancado(!!(user as any).is_trancado);

      // Lógica para determinar se o perfil pode ser editado.
      const rematriculaMonths = [0, 1, 6, 7]; // Jan, Fev, Jul, Ago
      const isRematriculaPeriod = rematriculaMonths.includes(new Date().getMonth());
      let isWithinUnlockWindow = false;
      if ((user as any).desbloqueio_aprovado_em) {
        const tenDaysLater = new Date(new Date((user as any).desbloqueio_aprovado_em).getTime() + 10 * 24 * 60 * 60 * 1000);
        isWithinUnlockWindow = new Date() < tenDaysLater;
        if (isWithinUnlockWindow) {
          setDaysToEdit(Math.ceil((tenDaysLater.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
      setCanEditProfile(isRematriculaPeriod || isWithinUnlockWindow);
    }
    if (user?.isAdmin) navigate('/admin/perfil');
  }, [user, navigate]);

  // Busca instituições e cursos.
  useEffect(() => {
    api.get('/institutions').then(res => setInstitutions(res.data || [])).catch(() => showNotification('Erro ao carregar instituições', 'error'));
  }, [showNotification]);

  useEffect(() => {
    if (selectedInstitution) {
      api.get(`/courses?institutionId=${selectedInstitution.id}`).then(res => setCourses(res.data || [])).catch(() => showNotification('Erro ao carregar cursos', 'error'));
    } else {
      setCourses([]);
    }
  }, [selectedInstitution, showNotification]);

  // Submete as atualizações do perfil.
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const payload = { nome, email, ra, periodo, previsaoTermino, instituicao_id: selectedInstitution?.id, curso_id: selectedCourse?.id };
      const response = await api.put('/perfil', payload);
      setUser(response.data.user);
      showNotification('Perfil atualizado!', 'success');
    } catch (error) {
      showNotification((error as any)?.response?.data?.message || 'Erro ao atualizar.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!user) return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Meu Perfil</Typography>
      {daysToEdit > 0 && <Alert severity="info" sx={{ mb: 2 }}>Você tem {daysToEdit} dias restantes para editar seu perfil.</Alert>}
      
      {/* Formulário de Informações Pessoais */}
      <Card sx={{ mb: 4 }}><CardHeader title="Informações Pessoais" /><Divider />
        <CardContent>
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'grid', gap: 2 }}>
            {/* Campos do formulário... */}
            <Button type="submit" variant="contained" disabled={!canEditProfile || loadingProfile} fullWidth>Salvar Informações</Button>
            {loadingProfile && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
          </Box>
        </CardContent>
      </Card>

      {/* Zona de Perigo: Trancar/Desbloquear Curso */}
      <Card sx={{ mt: 4 }}><CardHeader title="Zona de Perigo" /><Divider />
        <CardContent>
          <Typography sx={{ mb: 2 }}>A ação abaixo é irreversível e só pode ser desfeita no próximo período de rematrícula.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isTrancado ? (
              <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)} disabled={loadingAction}>Trancar Curso</Button>
            ) : (
              <Button variant="contained" color="warning" onClick={() => setUnlockConfirmOpen(true)} disabled={loadingAction}>Solicitar Desbloqueio</Button>
            )}
          </Box>
          
          {/* Diálogo de Confirmação de Trancamento */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirmar trancamento</DialogTitle>
            <DialogContent>
              <Typography>Tem certeza que deseja trancar o curso?</Typography>
              <TextField autoFocus margin="dense" id="motivo" label="Motivo do Trancamento" type="text" fullWidth variant="standard" value={motivoTrancamento} onChange={(e) => setMotivoTrancamento(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setConfirmOpen(false); setLoadingAction(true);
                try {
                  const res = await api.post('/trancar-curso', { motivo: motivoTrancamento });
                  setIsTrancado(true); setUser(res.data.user);
                  showNotification('Curso trancado.', 'success');
                } catch (err) { showNotification('Erro ao trancar.', 'error'); }
                finally { setLoadingAction(false); }
              }} color="error">Trancar</Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo de Solicitação de Desbloqueio */}
          <Dialog open={unlockConfirmOpen} onClose={() => setUnlockConfirmOpen(false)}>
            <DialogTitle>Solicitar Desbloqueio</DialogTitle>
            <DialogContent>
              <Typography>Informe o motivo do desbloqueio. Seu pedido será enviado para avaliação.</Typography>
              <TextField autoFocus margin="dense" id="motivo-desbloqueio" label="Motivo" type="text" fullWidth variant="standard" value={motivoDesbloqueio} onChange={(e) => setMotivoDesbloqueio(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUnlockConfirmOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setUnlockConfirmOpen(false); setLoadingAction(true);
                try {
                  await api.post('/request-desbloqueio', { motivo: motivoDesbloqueio });
                  showNotification('Pedido de desbloqueio enviado.', 'success');
                } catch (err) { showNotification('Erro ao solicitar.', 'error'); }
                finally { setLoadingAction(false); }
              }} color="primary">Enviar Solicitação</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Perfil;