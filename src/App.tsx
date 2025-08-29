import React from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Chip,
} from '@mui/material';
import {
  ViewModule,
  ViewStream,
  AutoAwesome,
  CompareArrows,
  Dashboard,
  DynamicForm,
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import { VersionA } from './versions/VersionA';
import { VersionB } from './versions/VersionB';
import { VersionC } from './versions/VersionC';
import { VersionD } from './versions/VersionD';
import { VersionE } from './versions/VersionE';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const VersionSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getCurrentVersion = () => {
    if (location.pathname.includes('/version-b')) return 'version-b';
    if (location.pathname.includes('/version-c')) return 'version-c';
    if (location.pathname.includes('/version-d')) return 'version-d';
    if (location.pathname.includes('/version-e')) return 'version-e';
    return 'version-a';
  };

  const handleVersionChange = (_: React.MouseEvent<HTMLElement>, newVersion: string | null) => {
    if (newVersion) {
      navigate(`/${newVersion}`);
    }
  };

  const getVersionInfo = (version: string) => {
    switch(version) {
      case 'version-a':
        return { label: 'Version A', desc: 'Classic Step-by-Step', icon: <ViewModule /> };
      case 'version-b':
        return { label: 'Version B', desc: 'Enhanced Navigation', icon: <ViewStream /> };
      case 'version-c':
        return { label: 'Version C', desc: 'AI Conversational', icon: <AutoAwesome /> };
      case 'version-d':
        return { label: 'Version D', desc: 'Visual Wizard', icon: <Dashboard /> };
      case 'version-e':
        return { label: 'Version E', desc: 'Dynamic Single Page', icon: <DynamicForm /> };
      default:
        return { label: '', desc: '', icon: null };
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Container maxWidth="xl">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <CompareArrows sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                BOP Rater Versions
              </Typography>
              <Chip 
                label="Design Exploration" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <ToggleButtonGroup
              value={getCurrentVersion()}
              exclusive
              onChange={handleVersionChange}
              aria-label="version selector"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderRadius: 2,
                  mx: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="version-a">
                <Box display="flex" alignItems="center" gap={1}>
                  {getVersionInfo('version-a').icon}
                  <Box textAlign="left">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getVersionInfo('version-a').label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {getVersionInfo('version-a').desc}
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="version-b">
                <Box display="flex" alignItems="center" gap={1}>
                  {getVersionInfo('version-b').icon}
                  <Box textAlign="left">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getVersionInfo('version-b').label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {getVersionInfo('version-b').desc}
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="version-c">
                <Box display="flex" alignItems="center" gap={1}>
                  {getVersionInfo('version-c').icon}
                  <Box textAlign="left">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getVersionInfo('version-c').label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {getVersionInfo('version-c').desc}
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="version-d">
                <Box display="flex" alignItems="center" gap={1}>
                  {getVersionInfo('version-d').icon}
                  <Box textAlign="left">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getVersionInfo('version-d').label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {getVersionInfo('version-d').desc}
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="version-e">
                <Box display="flex" alignItems="center" gap={1}>
                  {getVersionInfo('version-e').icon}
                  <Box textAlign="left">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getVersionInfo('version-e').label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {getVersionInfo('version-e').desc}
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <FormProvider>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <VersionSelector />
            <Routes>
              <Route path="/" element={<Navigate to="/version-a" replace />} />
              <Route path="/version-a" element={<VersionA />} />
              <Route path="/version-b" element={<VersionB />} />
              <Route path="/version-c" element={<VersionC />} />
              <Route path="/version-d" element={<VersionD />} />
              <Route path="/version-e" element={<VersionE />} />
            </Routes>
          </Box>
        </FormProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
