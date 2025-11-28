// Importa React e hooks, além de componentes do Material-UI para a estrutura do rodapé.
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
// Importa os modais de Termos de Uso e Política de Privacidade.
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';

/**
 * @component Footer
 * @description Componente de rodapé da aplicação. Exibe links para os Termos de Uso e
 * Política de Privacidade, além do aviso de direitos autorais.
 * Gerencia a exibição dos modais de termos e privacidade, abrindo-os automaticamente
 * se o usuário ainda não tiver concordado com eles.
 */
const Footer: React.FC = () => {
  // Estados para controlar a visibilidade dos modais.
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  // Estados para verificar se o usuário já concordou com os termos e a política.
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  // Efeito que roda uma vez na montagem do componente para verificar o localStorage.
  useEffect(() => {
    try {
      // Tenta carregar o estado de concordância do localStorage.
      const t = JSON.parse(localStorage.getItem('agreed_terms') || 'null');
      const p = JSON.parse(localStorage.getItem('agreed_privacy') || 'null');
      setAgreedTerms(Boolean(t?.agreed));
      setAgreedPrivacy(Boolean(p?.agreed));
    } catch (err) {
      // Ignora erros de parsing do JSON.
    }
  }, []);

  // Efeito que observa as variáveis de concordância e abre os modais se necessário.
  useEffect(() => {
    if (!agreedTerms) setOpenTerms(true);
    if (!agreedPrivacy) setOpenPrivacy(true);
  }, [agreedTerms, agreedPrivacy]);

  // Funções para atualizar o estado quando o usuário concorda com os termos ou privacidade.
  const handleAgreeTerms = () => setAgreedTerms(true);
  const handleAgreePrivacy = () => setAgreedPrivacy(true);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.default', // Cor de fundo do tema.
        color: 'text.secondary',
        py: 3,
        mt: 'auto', // Empurra o rodapé para o final da página.
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          {/* Links para abrir os modais. */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button onClick={() => setOpenTerms(true)} color="inherit" sx={{ textTransform: 'none', fontSize: '0.85rem' }}>Termos de Uso</Button>
            <Button onClick={() => setOpenPrivacy(true)} color="inherit" sx={{ textTransform: 'none', fontSize: '0.85rem' }}>Política de Privacidade</Button>
          </Box>
          {/* Texto de direitos autorais. */}
          <Typography variant="body2">
            © {new Date().getFullYear()} Avaliação Educacional. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
      {/* Renderiza os modais, que são controlados pelos estados 'open'. */}
      <TermsModal open={openTerms} onClose={() => setOpenTerms(false)} onAgree={handleAgreeTerms} />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} onAgree={handleAgreePrivacy} />
    </Box>
  );
};

export default Footer;