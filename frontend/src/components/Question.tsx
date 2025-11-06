import React from 'react';
// 1. Importar componentes de Formulário e Tipografia
import {
  Typography,
  TextField,
  Box,
  FormLabel,
  IconButton,
  Tooltip,
} from '@mui/material';

// 2. Definir os tipos para as props
interface QuestionProps {
  question: {
    id: number;
    texto: string;
    tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
    opcoes?: string[]; // Opcional para tipo 'TEXTO_LIVRE'
  };
  // score: 1..5 for ESCOLHA_UNICA
  score?: number | null;
  comment?: string;
  onScoreChange?: (score: number) => void;
  onCommentChange?: (comment: string) => void;
  isSubmitting: boolean;
}

const Question: React.FC<QuestionProps> = ({ question, score, comment, onScoreChange, onCommentChange, isSubmitting }) => {
  const { texto, tipo, opcoes } = question;

  const EMOJIS = ['😡', '😕', '😐', '🙂', '😄'];

  const renderQuestionType = () => {
    switch (tipo) {
      case 'ESCOLHA_UNICA':
        return (
          <Box sx={{ mt: 1 }}>
            <FormLabel component="legend" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>{texto}</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              {EMOJIS.map((emoji, idx) => {
                const value = idx + 1;
                const selected = score === value;
                return (
                  <Tooltip key={value} title={`${value} / 5`}>
                    <IconButton
                      onClick={() => onScoreChange && onScoreChange(value)}
                      disabled={isSubmitting}
                      size="large"
                      aria-label={`nota-${value}`}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1,
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
            {/* Comentário abaixo da nota */}
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Sua opinião descritiva é fundamental para a melhoria contínua:</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva os pontos positivos e/ou negativos..."
              value={comment || ''}
              onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
            />
          </Box>
        );
      case 'TEXTO_LIVRE':
        return (
          // 4. Usar TextField para respostas abertas
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{texto}</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={comment || ''}
              onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
            />
          </Box>
        );
      default:
        return <Typography>Tipo de questão não suportado.</Typography>;
    }
  };

  // 5. Usar Box para encapsular o componente
  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
      {renderQuestionType()}
    </Box>
  );
};

export default Question;