import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Autocomplete,
} from '@mui/material';

interface Institution {
  id: number;
  nome: string;
}

interface Course {
  id: number;
  nome: string;
}

const Perfil: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [previsaoTermino, setPrevisaoTermino] = useState('');
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isTrancado, setIsTrancado] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [motivoDesbloqueio, setMotivoDesbloqueio] = useState('');
  const [motivoTrancamento, setMotivoTrancamento] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const [canEditProfile, setCanEditProfile] = useState(false);
  const [daysToEdit, setDaysToEdit] = useState(0);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email ?? '');
      setRa((user as any).ra || '');
      setPeriodo((user as any).periodo || '');
      setPrevisaoTermino((user as any).previsao_termino || '');
      setIsTrancado(!!(user as any).is_trancado);

      const currentMonth = new Date().getMonth();
      const rematriculaMonths = [0, 1, 6, 7];
      const isRematriculaPeriod = rematriculaMonths.includes(currentMonth);

      let isWithinUnlockWindow = false;
      if ((user as any).desbloqueio_aprovado_em) {
        const approvalDate = new Date((user as any).desbloqueio_aprovado_em);
        const tenDaysLater = new Date(approvalDate);
        tenDaysLater.setDate(tenDaysLater.getDate() + 10);
        if (new Date() < tenDaysLater) {
          isWithinUnlockWindow = true;
          const today = new Date();
          const remaining = Math.ceil((tenDaysLater.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          setDaysToEdit(remaining);
        }
      }

      setCanEditProfile(isRematriculaPeriod || isWithinUnlockWindow);
    }
    if (user?.isAdmin) {
      navigate('/admin/perfil');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/institutions');
        setInstitutions(response.data);
        // If backend already provided institution name in user payload, set it immediately
        if (user && (user as any).instituicao_nome) {
          const instFromUser = (user as any).instituicao_nome;
          // Try to find matching institution by name, otherwise create a temporary object so Autocomplete shows it
          const found = response.data.find((i: any) => i.nome === instFromUser);
          if (found) setSelectedInstitution(found);
          else setSelectedInstitution({ id: (user as any).instituicao_id || null, nome: instFromUser });
        }
      } catch (error) {
        showNotification('Erro ao carregar instituições', 'error');
      }
    };
    fetchInstitutions();
  }, [showNotification]);

  useEffect(() => {
    if (selectedInstitution) {
      const fetchCourses = async () => {
        try {
          const response = await api.get(`/courses?institutionId=${selectedInstitution.id}`);
          setCourses(response.data);
          // If backend provided course name, set selectedCourse immediately as well
          if (user && (user as any).curso_nome) {
            const courseFromUser = (user as any).curso_nome;
            const foundCourse = response.data.find((c: any) => c.nome === courseFromUser);
            if (foundCourse) setSelectedCourse(foundCourse);
            else setSelectedCourse({ id: (user as any).curso_id || null, nome: courseFromUser });
          }
        } catch (error) {
          showNotification('Erro ao carregar cursos', 'error');
        }
      };
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [selectedInstitution, showNotification]);

  // These effects are now handled when institutions and courses are fetched, prioritizing backend-provided names.

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const payload: any = { 
        nome, 
        email, 
        ra, 
        periodo, 
        previsaoTermino, 
        instituicao_id: selectedInstitution?.id,
        curso_id: selectedCourse?.id
      };
      const response = await api.put('/perfil', payload);
      setUser(response.data.user);
      showNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      const msg = (error as any)?.response?.data?.message || 'Erro ao atualizar perfil.';
      showNotification(msg, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meu Perfil
      </Typography>

      {daysToEdit > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você tem {daysToEdit} dias restantes para editar seu perfil.
        </Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Informações Pessoais" />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={!canEditProfile || loadingProfile}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canEditProfile || loadingProfile}
              />
              <TextField
                fullWidth
                label="RA (Registro Acadêmico)"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                disabled={!canEditProfile || loadingProfile}
              />
            </Box>
            <Autocomplete
              options={institutions}
              getOptionLabel={(option) => option.nome}
              value={selectedInstitution}
              onChange={(_event, newValue) => {
                setSelectedInstitution(newValue);
                setSelectedCourse(null);
              }}
              renderInput={(params) => <TextField {...params} label="Instituição" />}
              disabled={!canEditProfile || loadingProfile}
            />
            <Autocomplete
              options={courses}
              getOptionLabel={(option) => option.nome}
              value={selectedCourse}
              onChange={(_event, newValue) => {
                setSelectedCourse(newValue);
              }}
              renderInput={(params) => <TextField {...params} label="Curso" />}
              disabled={!canEditProfile || loadingProfile || !selectedInstitution}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                select
                label="Período"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                disabled={!canEditProfile || loadingProfile}
                SelectProps={{ native: false }}
              >
                <option value="">Selecione</option>
                <option value="matutino">Matutino</option>
                <option value="noturno">Noturno</option>
                <option value="integral">Integral</option>
              </TextField>
              <TextField
                fullWidth
                id="previsao-termino"
                label="Previsão de término (mês/ano)"
                name="previsao-termino"
                type="month"
                value={previsaoTermino}
                onChange={(e) => setPrevisaoTermino(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ style: { paddingTop: 14 } }}
                disabled={!canEditProfile || loadingProfile}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!canEditProfile || loadingProfile}
                fullWidth
              >
                Salvar Informações
              </Button>
              {loadingProfile && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardHeader title="Zona de Perigo" />
        <Divider />
        <CardContent>
          <Typography sx={{ mb: 2 }}>
            A ação abaixo é irreversível e só pode ser desfeita no próximo período de rematrícula.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isTrancado ? (
              <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)} disabled={loadingAction}>
                Trancar Curso
              </Button>
            ) : (
              <Button variant="contained" color="warning" onClick={() => setUnlockConfirmOpen(true)} disabled={loadingAction}>
                Solicitar Desbloqueio
              </Button>
            )}
          </Box>

          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirmar trancamento</DialogTitle>
            <DialogContent>
              <Typography>
                Tem certeza que deseja trancar o curso? Para reativar seu vínculo, você precisará fazer uma solicitação de desbloqueio que passará por análise.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="motivo"
                label="Motivo do Trancamento"
                type="text"
                fullWidth
                variant="standard"
                value={motivoTrancamento}
                onChange={(e) => setMotivoTrancamento(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setConfirmOpen(false);
                setLoadingAction(true);
                try {
                  const res = await api.post('/trancar-curso', { motivo: motivoTrancamento });
                  setIsTrancado(true);
                  setUser(res.data.user);
                  showNotification('Curso trancado com sucesso.', 'success');
                } catch (err) {
                  showNotification('Erro ao trancar o curso.', 'error');
                } finally {
                  setLoadingAction(false);
                }
              }} color="error">Trancar</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={unlockConfirmOpen} onClose={() => setUnlockConfirmOpen(false)}>
            <DialogTitle>Solicitar Desbloqueio</DialogTitle>
            <DialogContent>
              <Typography>
                Para solicitar o desbloqueio do seu curso, por favor, informe o motivo. Seu pedido será enviado para avaliação.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="motivo-desbloqueio"
                label="Motivo do Desbloqueio"
                type="text"
                fullWidth
                variant="standard"
                value={motivoDesbloqueio}
                onChange={(e) => setMotivoDesbloqueio(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUnlockConfirmOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setUnlockConfirmOpen(false);
                setLoadingAction(true);
                try {
                  await api.post('/request-desbloqueio', { motivo: motivoDesbloqueio });
                  showNotification('Pedido de desbloqueio enviado ao admin.', 'success');
                } catch (err) {
                  showNotification('Erro ao solicitar desbloqueio.', 'error');
                } finally {
                  setLoadingAction(false);
                }
              }} color="primary">Enviar Solicitação</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Perfil;