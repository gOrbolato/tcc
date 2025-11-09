import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
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
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default', // Usa a cor de fundo pastel do tema
        color: 'text.secondary',
        py: 3,
        mt: 'auto',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button onClick={() => setOpenTerms(true)} color="inherit" sx={{ textTransform: 'none', fontSize: '0.85rem' }}>Termos de Uso</Button>
            <Button onClick={() => setOpenPrivacy(true)} color="inherit" sx={{ textTransform: 'none', fontSize: '0.85rem' }}>Política de Privacidade</Button>
          </Box>
          <Typography variant="body2">
            © {new Date().getFullYear()} Avaliação Educacional. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} onAgree={handleAgreeTerms} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} onAgree={handleAgreePrivacy} />
    </Box>
  );
};

export default Footer;