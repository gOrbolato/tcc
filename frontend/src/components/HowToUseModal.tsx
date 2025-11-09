import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  Timer as TimerIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

interface HowToUseModalProps {
  open: boolean;
  onClose: () => void;
}

const HowToUseModal: React.FC<HowToUseModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Bem-vindo(a) ao Sistema!
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText component="div" sx={{ mb: 2 }}>
          Aqui está um guia rápido para te ajudar a navegar:
        </DialogContentText>
        <List>
          <ListItem>
            <ListItemIcon>
              <MenuIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Menu Principal"
              secondary="Use o menu lateral (ou superior) para acessar todas as seções do sistema."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Voltar para o Início"
              secondary="Para retornar à tela principal do sistema, clique em 'Painel' no menu de navegação."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TimerIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Tempo de Avaliação"
              secondary="Você terá um tempo limite para preencher cada avaliação. Fique atento ao cronômetro!"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LockIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Salvar e Finalizar Avaliação"
              secondary="Você pode salvar seu progresso e continuar depois. Uma vez finalizada para envio, a avaliação não poderá mais ser editada. Revise com atenção!"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Perfil"
              secondary="Gerencie seus dados pessoais e altere sua senha a qualquer momento."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Entendi!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HowToUseModal;
