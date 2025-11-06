// src/components/Footer.tsx
import React from 'react';
import { Box, Container, Typography, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';

const Footer: React.FC = () => {
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem('agreed_terms') || 'null');
      const p = JSON.parse(localStorage.getItem('agreed_privacy') || 'null');
      setAgreedTerms(Boolean(t?.agreed));
      setAgreedPrivacy(Boolean(p?.agreed));
    } catch (err) {
      // ignore
    }
  }, []);

  // Auto-open if not agreed
  useEffect(() => {
    if (!agreedTerms) setOpenTerms(true);
    if (!agreedPrivacy) setOpenPrivacy(true);
  }, [agreedTerms, agreedPrivacy]);

  const handleAgreeTerms = () => setAgreedTerms(true);
  const handleAgreePrivacy = () => setAgreedPrivacy(true);
  return (
    // 1. Usar <Box component="footer">
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        p: 1, 
      }}
    >
      <Container maxWidth="lg">
        {/* 2. Layout responsivo usando CSS Grid via Box */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 4, alignItems: 'center' }}>
          <Box sx={{ gridColumn: { xs: '1 / 2', sm: '1 / 2' }, textAlign: { xs: 'left', sm: 'left' } }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontSize: '0.95rem' }}>
              Legal
            </Typography>
            <Button onClick={() => setOpenTerms(true)} sx={{ display: 'block', textTransform: 'none', color: 'text.secondary', p: 0, minWidth: 0, fontSize: '0.8rem' }}>Termos de Uso</Button>
            <Button onClick={() => setOpenPrivacy(true)} sx={{ display: 'block', textTransform: 'none', color: 'text.secondary', p: 0, minWidth: 0, fontSize: '0.8rem' }}>Política de Privacidade</Button>
            {agreedTerms && <Typography variant="caption" color="success.main">Lido</Typography>}
            {agreedPrivacy && <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>Lido</Typography>}
          </Box>

          <Box sx={{ gridColumn: { xs: '1 / 2', sm: '2 / 3' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Avaliação Educacional
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plataforma para avaliação de Instituição e Curso.
            </Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / 2', sm: '3 / 4' }, textAlign: { xs: 'center', sm: 'right' } }}>
            {/* Right column left intentionally for symmetry; keep copyright here */}
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          © {new Date().getFullYear()} Todos os direitos acadêmicos reservados.
        </Typography>
      </Container>
      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
    </Box>
  );
};

export default Footer;