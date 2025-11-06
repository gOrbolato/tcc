import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Checkbox, FormControlLabel, Box } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
  requireAcceptance?: boolean;
  onAgree?: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ open, onClose, requireAcceptance = false, onAgree }) => {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const handleAgree = () => {
    if (saving) return;
    setSaving(true);
    const VERSION = '1.0';
    const payload = { type: 'privacy', agreed: true, version: VERSION, source: 'footer_modal' };
    api.post('/consent', payload).then(() => {
      try { localStorage.setItem('agreed_privacy', JSON.stringify({ agreed: true, at: new Date().toISOString(), version: VERSION })); } catch (e) {}
      showNotification('Política de Privacidade aceita', 'success');
      onAgree?.();
      setSaving(false);
      onClose();
    }).catch(() => {
      setSaving(false);
      showNotification('Falha ao gravar no servidor. Verifique sua conexão e tente novamente.', 'error');
    });
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (requireAcceptance && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      disableEscapeKeyDown={requireAcceptance}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Política de Privacidade</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" paragraph>
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos os
            dados pessoais dos usuários da plataforma "Avaliação Educacional".
          </Typography>

          <Typography variant="body2" paragraph>
            1. Dados coletados
            <br />
            Coletamos dados fornecidos diretamente (ex.: nome, e-mail, RA) e dados gerados pelo uso da
            plataforma (ex.: IP, user-agent, respostas de avaliações). Alguns dados são obrigatórios para
            o funcionamento do serviço.
          </Typography>

          <Typography variant="body2" paragraph>
            2. Finalidade do tratamento
            <br />
            Utilizamos os dados para: (i) autenticação e identificação; (ii) geração de relatórios agregados;
            (iii) comunicação com usuários; e (iv) cumprimento de obrigações legais.
          </Typography>

          <Typography variant="body2" paragraph>
            3. Compartilhamento e base legal
            <br />
            Não vendemos dados pessoais. Compartilhamos informações com provedores de infraestrutura e
            apenas quando necessário para cumprir obrigações legais. O tratamento baseia-se no consentimento
            do titular e em outras bases legais previstas na LGPD.
          </Typography>

          <Typography variant="body2" paragraph>
            4. Segurança e retenção
            <br />
            Adotamos medidas técnicas e organizacionais para proteger os dados. Os prazos de retenção variam
            conforme a natureza dos dados e exigências legais.
          </Typography>

          <Typography variant="body2" paragraph>
            5. Direitos dos titulares
            <br />
            Você pode solicitar acesso, correção, portabilidade ou exclusão de seus dados. Para exercer
            esses direitos, entre em contato com o suporte pelo e-mail informado na plataforma.
          </Typography>

          <Typography variant="body2" paragraph>
            6. Contato
            <br />
            Em caso de dúvidas sobre esta política ou sobre o tratamento de dados, contate o responsável
            pelo tratamento através do e-mail: suporte@example.com.
          </Typography>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} disabled={saving} />}
          label="Li e estou ciente da Política de Privacidade"
        />
      </DialogContent>
      <DialogActions>
  {!requireAcceptance && <Button onClick={onClose} disabled={saving}>Fechar</Button>}
  <Button onClick={handleAgree} variant="contained" disabled={!checked || saving}>{saving ? 'Gravando...' : 'Concordo'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrivacyModal;
