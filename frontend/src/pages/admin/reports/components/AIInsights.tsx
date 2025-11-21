import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  insights: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Análise e Sugestões da IA
        </Typography>
        <Box sx={{ whiteSpace: 'pre-wrap' }}>
          <Typography variant="body2">{insights}</Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default AIInsights;
