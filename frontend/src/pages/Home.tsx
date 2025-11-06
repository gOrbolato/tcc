import React, { useState, useCallback } from 'react';
import { Box, Container, Typography, Button, Paper, IconButton, Avatar, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RoomIcon from '@mui/icons-material/Room';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ShieldIcon from '@mui/icons-material/Shield';

import api from '../services/api';
import guilhermeOrbolatoImg from '../assets/images/guilhermeOrbolato.jpg';
import educationHero from '../assets/images/imagem-fundo.png';


type Institution = { id: number; nome: string; latitude?: number; longitude?: number; average_media_final?: number; distance?: number };

const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [usingLocation, setUsingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Institution[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleUseLocation = useCallback(() => {
    if (usingLocation) {
      setUsingLocation(false);
      setCoords(null);
      return;
    }
    if (!('geolocation' in navigator)) {
      setError('Geolocalização não disponível no seu navegador.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUsingLocation(true);
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('Permissão de localização negada ou indisponível.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [usingLocation]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let response;
      if (usingLocation && coords) {
        response = await api.get('/entities/institutions/nearby', { params: { latitude: coords.latitude, longitude: coords.longitude, radius: 100 } });
      } else {
        response = await api.get('/entities/institutions', { params: { q: query.trim() } });
      }
      setResults(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar.');
    } finally {
      setLoading(false);
    }
  }, [query, usingLocation, coords]);

  return (
    <Box>
      {/* Hero */}
  <Box sx={{ position: 'relative', py: { xs: 8, md: 12 }, backgroundImage: `url(${educationHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,20,30,0.28), rgba(20,20,30,0.28))' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4, py: 6 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', maxWidth: 900 }}>
                Consulte e Transforme a Educação
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 4, color: 'rgba(255,255,255,0.9)', maxWidth: 730, mx: 'auto' }}>
                Pesquise por instituição, curso ou cidade para ver avaliações. Se é aluno, contribua de forma anônima para a melhoria do seu ensino.
              </Typography>

              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, width: '100%', justifyContent: 'center' }}>
                <Paper sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, width: { xs: '85%', md: 600 }, borderRadius: 50 }} elevation={3}>
                  <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSearch} disabled={loading}>
                    <SearchIcon />
                  </IconButton>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16 }}
                    placeholder="Digite o nome da instituição, curso ou cidade..."
                  />
                  <IconButton aria-label="location" color={usingLocation ? 'primary' : 'default'} onClick={handleUseLocation} disabled={loading}>
                    {loading && usingLocation ? <CircularProgress size={20} /> : <RoomIcon />}
                  </IconButton>
                </Paper>
                <Button onClick={handleSearch} variant="contained" sx={{ px: 4, py: 1.5, bgcolor: '#6a4cff', borderRadius: 6 }} disabled={loading}>
                  Buscar
                </Button>
              </Box>

              {loading && <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.9)' }} variant="body2">Buscando... <CircularProgress size={16} sx={{ ml: 1 }} /></Typography>}
              {error && <Typography sx={{ mt: 2 }} color="error">{error}</Typography>}
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Como Funciona */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 4, fontWeight: 700 }}>
          Como Funciona?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#e8f0ff', mr: 2 }}><SearchIcon color="primary" /></Avatar>
              <Typography variant="h6">Pesquisa Aberta</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#fff0f6', mr: 2 }}><ShieldIcon color="secondary" /></Avatar>
              <Typography variant="h6">Avaliação Anônima</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Para contribuir, crie sua conta e responda aos questionários. Sua identidade é sempre preservada para que você se expresse livremente.</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#fff7e6', mr: 2 }}><WorkspacesIcon color="warning" /></Avatar>
              <Typography variant="h6">Análise e Melhorias</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">As avaliações são compiladas e analisadas pela administração para identificar pontos de melhoria e implementar mudanças efetivas.</Typography>
          </Paper>
        </Box>
      </Container>

      {/* Sobre a Plataforma */}
      <Box sx={{ background: '#f3f8ff', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
            <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 20px 60px rgba(60,80,120,0.08)' }}>
              {/* Prefer a user-provided about-photo.jpg in src/assets/images; if missing, fall back to educationHero */}
              <img
                src="/src/assets/images/imagem-sobre-plataforma.png"
                alt="sobre"
                style={{ width: '100%', display: 'block' }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src.endsWith('imagem-sobre-plataforma.png')) {
                    target.src = educationHero;
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
                Sobre a Plataforma
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                O Sistema de Avaliação Educacional é uma ferramenta desenvolvida para fortalecer a comunicação entre alunos e instituições de ensino. Acreditamos que o feedback construtivo é a chave para aprimorar a qualidade da infraestrutura, do material didático e da experiência acadêmica como um todo.
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
                <li>Feedback construtivo é a chave para aprimorar a qualidade da infraestrutura</li>
                <li>Melhoria do material didático e da experiência acadêmica</li>
                <li>Processo de avaliação seguro, anônimo e eficiente</li>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Desenvolvedores */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" textAlign="center" sx={{ mb: 4, fontWeight: 700 }}>Desenvolvedores</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar src={guilhermeOrbolatoImg} sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">Guilherme Orbolato</Typography>
            <Typography variant="body2" color="primary">Desenvolvedor Full Stack</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Responsável pela concepção, desenvolvimento e implementação de todas as funcionalidades do sistema, desde o backend e banco de dados até a interface do usuário no frontend.</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <IconButton component="a" href="https://github.com/gOrbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme GitHub">
                <GitHubIcon />
              </IconButton>
              <IconButton component="a" href="https://www.linkedin.com/in/guilherme-orbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">Felipe Nakano</Typography>
            <Typography variant="body2" color="primary">Desenvolvedor Full Stack</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Especialista em desenvolvimento full stack, contribuindo com expertise em arquitetura de software, integração de sistemas e otimização de performance.</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <IconButton component="a" href="https://github.com/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe GitHub">
                <GitHubIcon />
              </IconButton>
              <IconButton component="a" href="https://www.linkedin.com/in/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Apresentação do Projeto */}
      <Box sx={{ background: '#eef6ff', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" textAlign="center" sx={{ mb: 2, fontWeight: 700 }}>Apresentação do Projeto</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Este sistema é o resultado de um Trabalho de Conclusão de Curso (TCC) dedicado a aprimorar a comunicação e o feedback no ambiente educacional. O objetivo foi desenvolver uma ferramenta robusta, segura e de fácil utilização para alunos e administradores, promovendo um ciclo de melhoria contínua nas instituições de ensino.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;