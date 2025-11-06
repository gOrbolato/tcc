import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 1. Importar componentes de Layout e Cards do MUI
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  Box,
  Icon,
  Chip,
} from '@mui/material';

// 2. Importar Ícones para os cards
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';

// 3. (Opcional) Criar um tipo para os cards para facilitar
type DashboardCardProps = {
  title: string;
  description: string;
  link: string;
  icon: React.ReactElement;
};

// 4. Componente de Card reutilizável
const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, link, icon }) => (
  <Box sx={{ width: '100%' }}>
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon color="primary" sx={{ mr: 1.5, fontSize: '2.5rem' }}>
            {icon}
          </Icon>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
        </Box>
        <Typography color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={RouterLink} to={link}>
          Acessar
        </Button>
      </CardActions>
    </Card>
  </Box>
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userChanges, setUserChanges] = useState(0);
  const [entityChanges, setEntityChanges] = useState(0);

  useEffect(() => {
    // fetch admin notifications and classify them
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
        // ignore errors silently
      }
    })();
    return () => { mounted = false; };
  }, []);

  const navigate = useNavigate();
  return (
    // 5. Usar <Container> para centralizar e limitar a largura
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel Administrativo
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo, {user?.nome}!
      </Typography>

      {/* 6. Layout responsivo de cards usando CSS grid */}
      <Box sx={{ display: 'grid', gap: 24, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
        <Box sx={{ position: 'relative' }}>
          <DashboardCard
            title="Gerenciar Usuários"
            description="Editar ou remover usuários e permissões."
            link="/admin/gerenciar-usuarios"
            icon={<PeopleIcon />}
          />
          {userChanges > 0 && (
            <Chip
              label={`${userChanges} alterações`}
              color="warning"
              size="small"
              clickable
              onClick={() => navigate('/admin/gerenciar-usuarios?from=dashboard_notifications')}
              sx={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer' }}
            />
          )}
        </Box>
        <Box sx={{ position: 'relative' }}>
          <DashboardCard
            title="Gerenciar Entidades"
            description="Editar instituições e/ou cursos."
            link="/admin/gerenciar-entidades"
            icon={<SchoolIcon />}
          />
          {entityChanges > 0 && (
            <Chip
              label={`${entityChanges} alterações`}
              color="warning"
              size="small"
              clickable
              onClick={() => navigate('/admin/gerenciar-entidades?from=dashboard_notifications')}
              sx={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer' }}
            />
          )}
        </Box>
        <DashboardCard
          title="Relatórios"
          description="Gerar e visualizar relatórios de dados das avaliações."
          link="/admin/relatorios"
          icon={<BarChartIcon />}
        />
        {/* Adicione mais cards conforme necessário */}
      </Box>
    </Container>
  );
};

export default AdminDashboard;