import React from 'react';
// 1. Importar componentes de Formulário e Tipografia
import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  TextField,
  Box,
  FormLabel,
} from '@mui/material';

// 2. Definir os tipos para as props
interface QuestionProps {
  question: {
    id: number;
    texto: string;
    tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
    opcoes?: string[]; // Opcional para tipo 'TEXTO_LIVRE'
  };
  resposta: string;
  onChange: (resposta: string) => void;
  isSubmitting: boolean;
}

const Question: React.FC<QuestionProps> = ({ question, resposta, onChange, isSubmitting }) => {
  const { texto, tipo, opcoes } = question;

  const renderQuestionType = () => {
    switch (tipo) {
      case 'ESCOLHA_UNICA':
        return (
          // 3. Usar FormControl e RadioGroup para as opções
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">{texto}</FormLabel>
            <RadioGroup
              aria-label={texto}
              name={String(question.id)}
              value={resposta}
              onChange={(e) => onChange(e.target.value)}
            >
              {opcoes?.map((opcao, index) => (
                <FormControlLabel
                  key={index}
                  value={String(index + 1)} // Assumindo que o valor é '1', '2', etc.
                  control={<Radio disabled={isSubmitting} />}
                  label={opcao}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'TEXTO_LIVRE':
        return (
          // 4. Usar TextField para respostas abertas
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label={texto}
            value={resposta}
            onChange={(e) => onChange(e.target.value)}
            disabled={isSubmitting}
            margin="normal"
          />
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