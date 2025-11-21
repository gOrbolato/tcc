import React from 'react';
import { Box, Typography, CircularProgress, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { motion } from 'framer-motion';

interface SuggestionsProps {
  analysis: string | null;
  loading: boolean;
}

// Função para parsear o texto da IA e transformar em componentes React
const renderAnalysis = (text: string) => {
  const theme = useTheme();

  // Divide o texto em seções principais baseadas nos títulos ###
  const sections = text.split('### ').filter(section => section.trim() !== '');

  return sections.map((section, index) => {
    const lines = section.split('\n').filter(line => line.trim() !== '');
    const title = lines.shift() || `Seção ${index + 1}`;

    const content = lines.map((line, lineIndex) => {
      // Transforma **negrito** em texto com fontWeight bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);

      let icon = null;
      let color = 'text.primary';
      let variant: "body1" | "body2" | "subtitle1" = "body2";

      if (line.includes("Ponto Crítico")) {
        icon = <ErrorOutlineIcon fontSize="small" />;
        color = 'error.main';
        variant = "subtitle1";
      } else if (line.includes("Ponto de Atenção")) {
        icon = <WarningAmberIcon fontSize="small" />;
        color = 'warning.main';
        variant = "subtitle1";
      } else if (line.includes("Ponto Forte") || line.includes("Ponto Positivo")) {
        icon = <CheckCircleOutlineIcon fontSize="small" />;
        color = 'success.main';
        variant = "subtitle1";
      } else if (line.includes("Recomendação:")) {
        icon = <LightbulbOutlinedIcon fontSize="small" />;
        color = 'info.main';
        variant = "subtitle1";
      }

      // Transforma listas numeradas e com asteriscos
      if (line.trim().match(/^\d+\./) || line.trim().startsWith('*')) {
        return (
          <ListItem key={lineIndex} sx={{ py: 0.5, pl: 2 }}>
            {icon && <ListItemIcon sx={{ minWidth: 30, color: color }}>{icon}</ListItemIcon>}
            <ListItemText 
              primary={
                <Typography variant={variant} color={color}>
                  {parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </Typography>
              } 
            />
          </ListItem>
        );
      }
      
      // Renderiza linhas normais, processando o negrito
      return (
        <Typography key={lineIndex} variant={variant} paragraph sx={{ color: color, mb: 1 }}>
          {parts.map((part, i) => 
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </Typography>
      );
    });

    return (
      <Accordion key={index} defaultExpanded={index < 2} sx={{ mb: 1, borderRadius: 1, '&:before': { display: 'none' } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${index}-content`}
          id={`panel${index}-header`}
          sx={{ 
            bgcolor: theme.palette.grey[100], 
            borderRadius: 1, 
            '&.Mui-expanded': { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
            minHeight: 48,
            px: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, border: `1px solid ${theme.palette.grey[200]}`, borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
          <List disablePadding>
            {content}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  });
};


const Suggestions: React.FC<SuggestionsProps> = ({ analysis, loading }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2, boxShadow: 3 }} elevation={0}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Análise e Recomendações</Typography>
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <CircularProgress />
          ) : analysis ? (
            renderAnalysis(analysis)
          ) : (
            <Typography color="textSecondary">Nenhuma análise gerada.</Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default Suggestions;
