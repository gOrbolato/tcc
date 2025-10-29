// src/pages/Home.tsx
import React from 'react';
import { Box, Container, Typography, Button, Paper, IconButton, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RoomIcon from '@mui/icons-material/Room';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';

const Home: React.FC = () => {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #eef6ff 100%)',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, alignItems: 'center', gap: 4 }}>
            <Box>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Typography variant="h3" component="h1" align="left" fontWeight={700} sx={{ color: '#4b2cd4' }}>
                  Consulte e Transforme a Educação
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
                  Pesquise por instituição, curso ou cidade para ver avaliações. Se é aluno, contribua de forma anônima para a melhoria do seu ensino.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, maxWidth: 650 }}>
                  <Paper component="form" sx={{ flex: 1, display: 'flex', alignItems: 'center', px: 2, py: 1 }} elevation={3}>
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                      <SearchIcon />
                    </IconButton>
                    <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16 }} placeholder="Digite o nome da instituição, curso ou cidade..." />
                    <IconButton aria-label="location">
                      <RoomIcon />
                    </IconButton>
                  </Paper>
                  <Button component={RouterLink} to="/registro" variant="contained" sx={{ px: 4, py: 1.5, bgcolor: '#6a4cff' }}>
                    Buscar
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Use a barra de busca para encontrar instituições ou clique no ícone de localização (localização ativada ✓)
                </Typography>
              </motion.div>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop" alt="hero" style={{ width: '100%', borderRadius: 12, boxShadow: '0 10px 30px rgba(100,60,200,0.12)' }} />
            </Box>
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
              <Typography variant="h6">1. Pesquisa Aberta</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#fff0f6', mr: 2 }}><ShieldIcon color="secondary" /></Avatar>
              <Typography variant="h6">2. Avaliação Anônima</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Para contribuir, crie sua conta e responda aos questionários. Sua identidade é sempre preservada para que você se expresse livremente.</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#fff7e6', mr: 2 }}><WorkspacesIcon color="warning" /></Avatar>
              <Typography variant="h6">3. Análise e Melhorias</Typography>
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
              <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop" alt="sobre" style={{ width: '100%', display: 'block' }} />
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
            <Avatar src="/public/assets/images/developer1.jpg" sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">Guilherme Orbolato</Typography>
            <Typography variant="body2" color="primary">Desenvolvedor Full Stack</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Responsável pela concepção, desenvolvimento e implementação de todas as funcionalidades do sistema, desde o backend e banco de dados até a interface do usuário no frontend.</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar src="/public/assets/images/developer2.jpg" sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">Felipe Nakano</Typography>
            <Typography variant="body2" color="primary">Desenvolvedor Full Stack</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Especialista em desenvolvimento full stack, contribuindo com expertise em arquitetura de software, integração de sistemas e otimização de performance.</Typography>
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