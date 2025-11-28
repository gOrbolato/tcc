// Importa React, hooks e componentes do Material-UI.
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Checkbox, FormControlLabel, Box } from '@mui/material';
// Importa o hook de notificação para exibir alertas.
import { useNotification } from '../contexts/NotificationContext';
// Importa a instância do cliente API.
import api from '../services/api';

// Interface para as propriedades do componente.
interface TermsModalProps {
  open: boolean; // Controla a visibilidade do modal.
  onClose: () => void; // Função para fechar o modal.
  requireAcceptance?: boolean; // Se `true`, impede o fechamento sem aceitar os termos.
  onAgree?: () => void; // Callback opcional executado após o aceite.
}

/**
 * @component TermsModal
 * @description Modal que exibe os Termos de Uso da plataforma.
 * Exige que o usuário marque uma caixa de seleção para confirmar a leitura e concordância.
 * A concordância é registrada no backend e no localStorage.
 */
const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, requireAcceptance = false, onAgree }) => {
  const [checked, setChecked] = useState(false); // Estado da caixa de seleção.
  const [saving, setSaving] = useState(false); // Estado para feedback de carregamento.
  const { showNotification } = useNotification();

  // Função executada ao clicar no botão "Concordo".
  const handleAgree = () => {
    if (saving) return;
    setSaving(true);
    const VERSION = '1.0';
    const payload = { type: 'terms', agreed: true, version: VERSION, source: 'footer_modal' };

    // Envia os dados de consentimento para a API.
    api.post('/consent', payload).then(() => {
      // Salva a concordância no localStorage para persistência.
      try { localStorage.setItem('agreed_terms', JSON.stringify({ agreed: true, at: new Date().toISOString(), version: VERSION })); } catch (e) {}
      showNotification('Termos aceitos', 'success');
      onAgree?.();
      setSaving(false);
      onClose();
    }).catch(() => {
      // Em caso de falha, não salva localmente e mantém o modal aberto para nova tentativa.
      setSaving(false);
      showNotification('Falha ao gravar no servidor. Verifique sua conexão e tente novamente.', 'error');
    });
  };

  return (
    <Dialog
      open={open}
      // Impede o fechamento do modal se a aceitação for obrigatória.
      onClose={(event, reason) => {
        if (requireAcceptance && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      disableEscapeKeyDown={requireAcceptance}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Termos de Uso</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          {/* Conteúdo textual dos Termos de Uso. */}
          <Typography variant="body2" paragraph>Estes Termos de Uso regem o acesso e uso da plataforma "Avaliação Educacional". Ao utilizar a plataforma, você concorda com estes termos e com as políticas a eles associadas. Caso não concorde, não utilize a plataforma.</Typography>
          <Typography variant="body2" paragraph>1. Objeto<br />A plataforma tem por objetivo disponibilizar serviços de coleta e análise de avaliações de instituições e cursos, permitindo que estudantes registrem opiniões e que administradores visualizem relatórios agregados.</Typography>
          <Typography variant="body2" paragraph>2. Registro e acesso<br />Para utilizar determinados recursos, é necessário criar uma conta. Você é responsável pela veracidade das informações fornecidas e pela guarda de suas credenciais; não compartilhe sua senha.</Typography>
          <Typography variant="body2" paragraph>3. Conduta do usuário<br />É proibido enviar conteúdo ilegal, ofensivo, difamatório ou violador de direitos de terceiros. Mensagens ou avaliações que violem estas regras poderão ser removidas e o usuário, suspenso.</Typography>
          <Typography variant="body2" paragraph>4. Conteúdo e propriedade intelectual<br />Os direitos de propriedade intelectual da plataforma e de seus conteúdos pertencem aos seus titulares. O usuário concede à plataforma uma licença não-exclusiva para uso do conteúdo publicado nas avaliações para fins de agregação e análise.</Typography>
          <Typography variant="body2" paragraph>5. Limitação de responsabilidade<br />A plataforma envida esforços razoáveis para manter a disponibilidade e integridade dos serviços, mas não garante operação ininterrupta. Não nos responsabilizamos por danos indiretos decorrentes do uso da plataforma.</Typography>
          <Typography variant="body2" paragraph>6. Alterações dos termos<br />Podemos atualizar estes Termos de Uso. Mudanças relevantes serão comunicadas; o uso continuado da plataforma após notificação constituirá aceitação das novas condições.</Typography>
          <Typography variant="body2" paragraph>7. Legislação aplicável<br />Estes termos seguem a legislação brasileira aplicável, inclusive a Lei Geral de Proteção de Dados (LGPD). Questões legais serão dirimidas no foro competente, salvo disposição em contrário.</Typography>
        </Box>

        {/* Checkbox de concordância. */}
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} disabled={saving} />}
          label="Li e concordo com os Termos de Uso"
        />
      </DialogContent>
      <DialogActions>
        {/* O botão "Fechar" só é exibido se a aceitação não for obrigatória. */}
        {!requireAcceptance && <Button onClick={onClose} disabled={saving}>Fechar</Button>}
        <Button onClick={handleAgree} variant="contained" disabled={!checked || saving}>{saving ? 'Gravando...' : 'Concordo'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsModal;

