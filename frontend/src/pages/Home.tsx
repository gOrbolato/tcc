// Importa React, hooks, componentes do Material-UI, ícones e assets.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Avatar, IconButton, TextField, Button, CircularProgress, List, ListItemButton, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { motion, AnimatePresence } from 'framer-motion';
import carousel1 from '../assets/images/imagem-carrossel1.png';
import carousel2 from '../assets/images/imagem-carrossel2.png';
import GeolocationConsentModal from '../components/GeolocationConsentModal';
import api from '../services/api';
import guilhermeOrbolatoImg from '../assets/images/guilhermeOrbolato.jpg';
import felipeNakanoImg from '../assets/images/felipeNakano.jpeg';

// Variantes para animação de seções da página.
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Itens da seção "Como Funciona".
const howItWorksItems = [
  { icon: <SearchIcon fontSize="large" />, title: 'Pesquise Avaliações', description: 'Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.' },
  { icon: <EditNoteIcon fontSize="large" />, title: 'Contribua Anonimamente', description: 'Crie sua conta para responder aos questionários. Sua identidade é 100% preservada para que você se expresse livremente.' },
  { icon: <TrendingUpIcon fontSize="large" />, title: 'Gere Melhorias', description: 'As avaliações são compiladas e analisadas pela administração para identificar pontos de melhoria e implementar mudanças efetivas.' }
];

type GeoConsentStatus = 'prompt' | 'granted' | 'denied';
interface Institution { id: number; nome: string; media_avaliacoes: number | null; }

/**
 * @component Home
 * @description A página inicial da plataforma. Apresenta a proposta de valor,
 * uma barra de pesquisa, seções informativas e informações sobre os desenvolvedores.
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeoModalOpen, setGeoModalOpen] = useState(false);
  const [geoConsentStatus, setGeoConsentStatus] = useState<GeoConsentStatus>('prompt');
  const [searchResults, setSearchResults] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [isGeoSearching, setIsGeoSearching] = useState<boolean>(false);

  // Realiza a busca por geolocalização.
  const performGeoSearch = () => {
    if (!navigator.geolocation) return;
    setIsGeoSearching(true);
    setSearchQuery('');
    setLoading(true);
    setNoResults(false);
    setSearchResults([]);
    navigator.geolocation.getCurrentPosition(
      (position) => handleSearchSubmit(undefined, { lat: position.coords.latitude, lon: position.coords.longitude }),
      (error) => {
        console.error("Erro ao obter localização:", error);
        setLoading(false);
        setIsGeoSearching(false);
        setNoResults(true);
      }
    );
  };

  // Carrega o status de consentimento de geolocalização ao montar o componente.
  useEffect(() => {
    const savedStatus = localStorage.getItem('geo_consent_status') as GeoConsentStatus | null;
    if (savedStatus) {
      setGeoConsentStatus(savedStatus);
      if (savedStatus === 'granted') performGeoSearch();
    }
  }, []);

  // Controla a exibição da mensagem "Nenhum resultado".
  useEffect(() => {
    if (noResults) {
      const timer = setTimeout(() => setNoResults(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [noResults]);

  // Submete a busca para a API.
  const handleSearchSubmit = async (event?: React.FormEvent, coords?: { lat: number; lon: number }) => {
    event?.preventDefault();
    const query = coords ? '' : searchQuery.trim();
    if (!query && !coords && !isGeoSearching) return;
    setLoading(true);
    setNoResults(false);
    setSearchResults([]);
    try {
      const url = coords ? '/institutions/nearby' : '/institutions';
      const params = coords ? { lat: coords.lat, lon: coords.lon } : { q: query };
      const response = await api.get(url, { params });
      if (response.data.length === 0) setNoResults(true);
      else setSearchResults(response.data);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      setNoResults(true);
    } finally {
      setLoading(false);
      setIsGeoSearching(false);
    }
  };

  // Funções para lidar com o consentimento de geolocalização.
  const handleAllowGeo = () => {
    localStorage.setItem('geo_consent_status', 'granted');
    setGeoConsentStatus('granted');
    setGeoModalOpen(false);
    performGeoSearch();
  };
  const handleDenyGeo = () => {
    localStorage.setItem('geo_consent_status', 'denied');
    setGeoConsentStatus('denied');
    setGeoModalOpen(false);
  };
  const handleGeoIconClick = () => {
    if (geoConsentStatus === 'granted') performGeoSearch();
    else setGeoModalOpen(true);
  };

  return (
    <Box>
      {/* Seção Hero */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography variant="h2" component="h1" fontWeight={700}>Consulte e Transforme a Educação</Typography>
            <Typography variant="h6" component="p" sx={{ mt: 2, mb: 4, maxWidth: 760, mx: 'auto', opacity: 0.9 }}>Sua voz tem o poder de moldar o futuro do ensino. Pesquise, avalie e contribua para a melhoria contínua.</Typography>
          </motion.div>
          {/* Barra de Pesquisa */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 'lg', mx: 'auto', py: 4 }}>
              <TextField variant="outlined" placeholder="Pesquisar por instituição, curso ou cidade..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ flex: '1 1 500px', maxWidth: '600px', '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white', color: 'text.primary' } }} />
              <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={handleGeoIconClick} sx={{ py: '15px', px: 3, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.9)', color: 'primary.main', borderColor: 'primary.main', '&:hover': { bgcolor: 'white', borderColor: 'primary.dark' } }}>Perto de mim</Button>
              <Button type="submit" variant="contained" size="large" sx={{ py: '15px', px: 5, borderRadius: '8px' }}>Buscar</Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Resultados da Pesquisa */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {isGeoSearching && <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}><CircularProgress sx={{ mb: 2 }} /><Typography textAlign="center">Buscando instituições perto de você...</Typography></Box>}
        {loading && !isGeoSearching && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
        {noResults && !loading && !isGeoSearching && <Typography textAlign="center" sx={{ my: 4 }}>Nenhum resultado encontrado para sua busca.</Typography>}
        {searchResults.length > 0 && (
          <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, bgcolor: (theme) => theme.palette.grey[100] }}><Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Resultados da Busca</Typography></Toolbar>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Instituição</TableCell><TableCell align="right">Nota Média</TableCell></TableRow></TableHead>
                <TableBody>
                  {searchResults.map((institution) => (
                    <TableRow key={institution.id} hover onClick={() => navigate(`/institutions/${institution.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell component="th" scope="row">{institution.nome}</TableCell>
                      <TableCell align="right">{typeof institution.media_avaliacoes === 'number' ? institution.media_avaliacoes.toFixed(1) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* Modal de Geolocalização */}
      <GeolocationConsentModal open={isGeoModalOpen} onClose={() => setGeoModalOpen(false)} onAllow={handleAllowGeo} onDeny={handleDenyGeo} />

      {/* Seção "Como Funciona" */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>Como Funciona?</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {howItWorksItems.map((item, index) => (
              <motion.div key={index} whileHover={{ y: -8 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', mx: 'auto' }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight={600}>{item.title}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{item.description}</Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Container>
      </motion.div>

      {/* Seção "Sobre a Plataforma" */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
              <motion.div whileHover={{ scale: 1.03 }} style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative' }}><Carousel /></motion.div>
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

      {/* Seção "Desenvolvedores" */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>Desenvolvedores</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 4, maxWidth: 'md', mx: 'auto' }}>
            <motion.div whileHover={{ y: -8 }}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Avatar src={guilhermeOrbolatoImg} sx={{ width: 96, height: 96, mx: 'auto', mb: 2, border: '3px solid', borderColor: 'primary.main' }} />
                <Typography variant="h6">Guilherme Orbolato</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">Desenvolvedor Full Stack</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flexGrow: 1 }}>Responsável pela arquitetura do backend, banco de dados, e implementação das principais lógicas de negócio do sistema.</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <IconButton color="primary" component="a" href="https://github.com/gOrbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme GitHub"><GitHubIcon /></IconButton>
                  <IconButton color="primary" component="a" href="https://www.linkedin.com/in/guilherme-orbolato" target="_blank" rel="noopener noreferrer" aria-label="Guilherme LinkedIn"><LinkedInIcon /></IconButton>
                </Box>
              </Paper>
            </motion.div>
            <motion.div whileHover={{ y: -8 }}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Avatar src={felipeNakanoImg} sx={{ width: 96, height: 96, mx: 'auto', mb: 2, border: '3px solid', borderColor: 'primary.main' }} />
                <Typography variant="h6">Felipe Nakano</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">Desenvolvedor Full Stack</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flexGrow: 1 }}>Focado na experiência do usuário, design da interface e desenvolvimento frontend, garantindo uma plataforma intuitiva e agradável.</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <IconButton color="primary" component="a" href="https://github.com/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe GitHub"><GitHubIcon /></IconButton>
                  <IconButton color="primary" component="a" href="https://www.linkedin.com/in/felipenakano" target="_blank" rel="noopener noreferrer" aria-label="Felipe LinkedIn"><LinkedInIcon /></IconButton>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Container>
      </motion.div>

      {/* Seção "Apresentação do Projeto" */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, fontWeight: 700 }}>Apresentação do Projeto</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Este sistema é o resultado de um Trabalho de Conclusão de Curso (TCC) dedicado a aprimorar a comunicação e o feedback no ambiente educacional. O objetivo foi desenvolver uma ferramenta robusta, segura e de fácil utilização para alunos e administradores.</Typography>
            </Paper>
          </Container>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Home;

// Componente de Carrossel simples.
function Carousel() {
  const images = [carousel1, carousel2];
  const durations = [5000, 5000];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % images.length), durations[index] || 5000);
    return () => window.clearTimeout(id);
  }, [index]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 320 }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`slide-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </AnimatePresence>
    </Box>
  );
}