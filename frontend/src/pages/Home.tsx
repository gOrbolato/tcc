import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Avatar, IconButton, TextField, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { motion } from 'framer-motion';

import GeolocationConsentModal from '../components/GeolocationConsentModal';
import guilhermeOrbolatoImg from '../assets/images/guilhermeOrbolato.jpg';
import educationHero from '../assets/images/imagem-fundo.png';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

type GeoConsentStatus = 'prompt' | 'granted' | 'denied';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeoModalOpen, setGeoModalOpen] = useState(false);
  const [geoConsentStatus, setGeoConsentStatus] = useState<GeoConsentStatus>('prompt');

  useEffect(() => {
    const savedStatus = localStorage.getItem('geo_consent_status') as GeoConsentStatus | null;
    if (savedStatus) {
      setGeoConsentStatus(savedStatus);
    }
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAllowGeo = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Lat:', position.coords.latitude, 'Lon:', position.coords.longitude);
        setSearchQuery('Usando minha localização...');
        localStorage.setItem('geo_consent_status', 'granted');
        setGeoConsentStatus('granted');
        setGeoModalOpen(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        localStorage.setItem('geo_consent_status', 'denied');
        setGeoConsentStatus('denied');
        setGeoModalOpen(false);
      }
    );
  };

  const handleDenyGeo = () => {
    localStorage.setItem('geo_consent_status', 'denied');
    setGeoConsentStatus('denied');
    setGeoModalOpen(false);
  };

  const handleGeoIconClick = () => {
    if (geoConsentStatus === 'prompt') {
      setGeoModalOpen(true);
    } else if (geoConsentStatus === 'denied') {
      setGeoModalOpen(true); 
    } else if (geoConsentStatus === 'granted') {
      handleAllowGeo();
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography variant="h2" component="h1" fontWeight={700}>
              Consulte e Transforme a Educação
            </Typography>
            <Typography variant="h6" component="p" sx={{ mt: 2, mb: 4, maxWidth: 760, mx: 'auto', opacity: 0.9 }}>
              Sua voz tem o poder de moldar o futuro do ensino. Pesquise, avalie e contribua para a melhoria contínua.
            </Typography>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ display: 'flex', gap: 1, alignItems: 'center', maxWidth: 'md', mx: 'auto' }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Pesquisar por instituição, curso ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: '50px',
                    bgcolor: 'white',
                    color: 'text.primary',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' },
                  }
                }}
              />
              <IconButton onClick={handleGeoIconClick} sx={{ bgcolor: 'white', color: geoConsentStatus === 'granted' ? 'primary.main' : 'action.disabled', '&:hover': { bgcolor: '#f0f0f0' } }}>
                <MyLocationIcon />
              </IconButton>
              <Button type="submit" variant="contained" sx={{ borderRadius: '50px', px: 4, py: '15px' }}>
                <SearchIcon />
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Geolocation Modal */}
      <GeolocationConsentModal 
        open={isGeoModalOpen} 
        onClose={() => setGeoModalOpen(false)} 
        onAllow={handleAllowGeo} 
        onDeny={handleDenyGeo} 
      />

      {/* Como Funciona */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>
            Como Funciona?
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[...Array(3)].map((_, index) => (
              <motion.div key={index} whileHover={{ y: -8 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600}>{['1. Pesquise Avaliações', '2. Contribua Anonimamente', '3. Gere Melhorias'][index]}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{['Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.', 'Crie sua conta para responder aos questionários. Sua identidade é 100% preservada para que você se expresse livremente.', 'As avaliações são compiladas e analisadas pela administração para identificar pontos de melhoria e implementar mudanças efetivas.'][index]}</Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Container>
      </motion.div>

      {/* Sobre a Plataforma */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
              <motion.div whileHover={{ scale: 1.03 }} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <img src="/src/assets/images/imagem-sobre-plataforma.png" alt="sobre" style={{ width: '100%', display: 'block' }} onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (t.src.endsWith('imagem-sobre-plataforma.png')) t.src = educationHero; }} />
              </motion.div>
              <Box>
                <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 700 }}>Sobre a Plataforma</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Nossa plataforma é a ponte entre alunos e instituições. Facilitamos o feedback construtivo para impulsionar a qualidade da educação.</Typography>
                <Box component="ul" sx={{ pl: 3, color: 'text.secondary', '& li': { mb: 1 } }}>
                  <li>Feedback construtivo que ajuda a melhorar infraestrutura e ensino.</li>
                  <li>Processo de avaliação seguro, anônimo e eficiente.</li>
                  <li>Ferramentas para monitoramento e ação institucional.</li>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </motion.div>

      {/* Desenvolvedores */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>Desenvolvedores</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 4, maxWidth: 'md', mx: 'auto' }}>
            <motion.div whileHover={{ y: -8 }}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Avatar src={guilhermeOrbolatoImg} sx={{ width: 96, height: 96, mx: 'auto', mb: 2, border: '3px solid', borderColor: 'primary.main' }} />
                <Typography variant="h6">Guilherme Orbolato</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">Desenvolvedor Full Stack</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flexGrow: 1 }}>
                  Responsável pela arquitetura do backend, banco de dados, e implementação das principais lógicas de negócio do sistema.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <IconButton color="primary" component="a" href="https://github.com/gOrbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme GitHub"><GitHubIcon /></IconButton>
                  <IconButton color="primary" component="a" href="https://www.linkedin.com/in/guilherme-orbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme LinkedIn"><LinkedInIcon /></IconButton>
                </Box>
              </Paper>
            </motion.div>
            <motion.div whileHover={{ y: -8 }}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>FN</Avatar>
                <Typography variant="h6">Felipe Nakano</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">Desenvolvedor Full Stack</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flexGrow: 1 }}>
                  Focado na experiência do usuário, design da interface e desenvolvimento frontend, garantindo uma plataforma intuitiva e agradável.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <IconButton color="primary" component="a" href="https://github.com/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe GitHub"><GitHubIcon /></IconButton>
                  <IconButton color="primary" component="a" href="https://www.linkedin.com/in/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe LinkedIn"><LinkedInIcon /></IconButton>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Container>
      </motion.div>

      {/* Apresentação do Projeto */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, fontWeight: 700 }}>Apresentação do Projeto</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Este sistema é o resultado de um Trabalho de Conclusão de Curso (TCC) dedicado a aprimorar a comunicação e o feedback no ambiente educacional. O objetivo foi desenvolver uma ferramenta robusta, segura e de fácil utilização para alunos e administradores.
              </Typography>
            </Paper>
          </Container>
        </Box>
      </motion.div>

    </Box>
  );
};

export default Home;