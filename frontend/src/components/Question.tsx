// Importa React e componentes do Material-UI.
import React from 'react';
import {
  Typography,
  TextField,
  Box,
  FormLabel,
  IconButton,
  Tooltip,
} from '@mui/material';

// Interface para as propriedades do componente Question.
interface QuestionProps {
  question: {
    id: number;
    texto: string;
    tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
    opcoes?: string[]; // Opcional, não utilizado atualmente.
  };
  score?: number | null; // A nota (1 a 5) para questões de escolha única.
  comment?: string; // O comentário de texto livre.
  onScoreChange?: (score: number) => void; // Callback para quando a nota muda.
  onCommentChange?: (comment: string) => void; // Callback para quando o comentário muda.
  isSubmitting: boolean; // Flag para desabilitar os campos durante o envio.
}

/**
 * @component Question
 * @description Componente reutilizável que renderiza uma única questão de avaliação.
 * Pode ser do tipo 'ESCOLHA_UNICA' (com seleção de nota e campo de comentário) ou
 * 'TEXTO_LIVRE' (apenas com campo de comentário).
 */
const Question: React.FC<QuestionProps> = ({ question, score, comment, onScoreChange, onCommentChange, isSubmitting }) => {
  const { texto, tipo } = question;

  // Emojis para representar as notas de 1 a 5.
  const EMOJIS = ['😡', '😕', '😐', '🙂', '😄'];

  // Função para renderizar o tipo correto de questão.
  const renderQuestionType = () => {
    switch (tipo) {
      case 'ESCOLHA_UNICA':
        return (
          <Box sx={{ mt: 1 }}>
            <FormLabel component="legend" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>{texto}</FormLabel>
            {/* Mapeia os emojis para criar os botões de seleção de nota. */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              {EMOJIS.map((emoji, idx) => {
                const value = idx + 1;
                const selected = score === value;
                return (
                  <Tooltip key={value} title={`${value} / 5`}>
                    <IconButton
                      onClick={() => onScoreChange?.(value)}
                      disabled={isSubmitting}
                      size="large"
                      aria-label={`nota-${value}`}
                      sx={{
                        width: 44, height: 44, borderRadius: 1,
                        border: selected ? '2px solid #6a4cff' : '1px solid #e6e6e6',
                        bgcolor: selected ? 'rgba(106,76,255,0.06)' : '#fff'
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{emoji}</span>
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>
            {/* Campo de texto para o comentário associado à nota. */}
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Sua opinião descritiva é fundamental para a melhoria contínua:</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva os pontos positivos e/ou negativos..."
              value={comment || ''}
              onChange={(e) => onCommentChange?.(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
            />
          </Box>
        );
      case 'TEXTO_LIVRE':
        return (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{texto}</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={comment || ''}
              onChange={(e) => onCommentChange?.(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
            />
          </Box>
        );
      default:
        return <Typography>Tipo de questão não suportado.</Typography>;
    }
  };

  return (
    // Container que envolve cada questão com uma borda e espaçamento.
    <Box sx={{ mb: 3, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
      {renderQuestionType()}
    </Box>
  );
};

export default Question;