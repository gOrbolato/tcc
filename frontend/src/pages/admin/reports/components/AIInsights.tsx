// Importa React, componentes do Material-UI e Framer Motion para animações.
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Interface para as propriedades do componente.
interface AIInsightsProps {
  insights: string; // O texto com as análises e sugestões geradas pela IA.
}

/**
 * @component AIInsights
 * @description Um componente para exibir as análises e sugestões geradas por
 * inteligência artificial. Apresenta o texto dentro de um card estilizado.
 */
const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  return (
    // Animação de entrada do componente.
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* O Paper serve como um container com elevação (sombra). */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Análise e Sugestões da IA
        </Typography>
        {/* O `whiteSpace: 'pre-wrap'` preserva as quebras de linha e espaços do texto. */}
        <Box sx={{ whiteSpace: 'pre-wrap' }}>
          <Typography variant="body2">{insights}</Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default AIInsights;
