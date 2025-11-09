import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Icon,
  Chip,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';

type DashboardCardProps = {
  title: string;
  description: string;
  link: string;
  icon: React.ReactElement;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Card reutilizável com novo design
const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, link, icon }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    style={{ height: '100%' }}
  >
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon color="primary" sx={{ mr: 1.5, fontSize: '2.5rem' }}>
          {icon}
        </Icon>
        <Typography variant="h5" component="h2" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
        {description}
      </Typography>
      <Button variant="outlined" component={RouterLink} to={link} sx={{ mt: 2, alignSelf: 'flex-start' }}>
        Acessar
      </Button>
    </Paper>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userChanges, setUserChanges] = useState(0);
  const [entityChanges, setEntityChanges] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = (await import('../../services/api')).default;
        const res = await api.get('/admin/notifications');
        if (!mounted) return;
        const notes: any[] = res.data || [];
        const userKeywords = ['usuário', 'usuario', 'user', 'ativar', 'desativar', 'reativa'];
        const entityKeywords = ['institui', 'curso', 'instituição', 'curso', 'entidade'];
        let u = 0; let e = 0;
        for (const n of notes) {
          const text = (n.mensagem || '' + n.nome || '').toString().toLowerCase();
          if (userKeywords.some(k => text.includes(k))) u++;
          if (entityKeywords.some(k => text.includes(k))) e++;
        }
        setUserChanges(u);
        setEntityChanges(e);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Painel Administrativo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Bem-vindo, {user?.nome}!
        </Typography>

        <Box
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}
        >
          <Box sx={{ position: 'relative' }}>
            <DashboardCard
              title="Gerenciar Usuários"
              description="Ativar, desativar e editar usuários e suas permissões."
              link="/admin/gerenciar-usuarios"
              icon={<PeopleIcon />}
            />
            {userChanges > 0 && (
              <Chip
                label={`${userChanges} novas solicitações`}
                color="warning"
                size="small"
                clickable
                onClick={() => navigate('/admin/gerenciar-usuarios?from=dashboard_notifications')}
                sx={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer', fontWeight: 600 }}
              />
            )}
          </Box>
          <Box sx={{ position: 'relative' }}>
            <DashboardCard
              title="Gerenciar Entidades"
              description="Adicionar e editar instituições e cursos disponíveis na plataforma."
              link="/admin/gerenciar-entidades"
              icon={<SchoolIcon />}
            />
            {entityChanges > 0 && (
              <Chip
                label={`${entityChanges} novas solicitações`}
                color="warning"
                size="small"
                clickable
                onClick={() => navigate('/admin/gerenciar-entidades?from=dashboard_notifications')}
                sx={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer', fontWeight: 600 }}
              />
            )}
          </Box>
          <DashboardCard
            title="Relatórios"
            description="Gerar e visualizar relatórios de dados das avaliações."
            link="/admin/relatorios"
            icon={<BarChartIcon />}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;