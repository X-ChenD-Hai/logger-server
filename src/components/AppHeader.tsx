import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  Search as SearchIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
interface ServerStatus {
  running: boolean;
  port?: number;
}

interface AppHeaderProps {
  serverStatus: ServerStatus;
  port: string;
  setPort: (port: string) => void;
  startServer: () => void;
  stopServer: () => void;
  receivedMessagesCount: number;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  onSaveLogs: () => void;
  onLoadLogs: () => void;
  statusMessage?: string;
  showSearchBar: boolean;
  setShowSearchBar: (show: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  serverStatus,
  port,
  setPort,
  startServer,
  stopServer,
  receivedMessagesCount,
  showSettings,
  setShowSettings,
  darkMode,
  setDarkMode,
  onSaveLogs,
  onLoadLogs,
  statusMessage,
  showSearchBar,
  setShowSearchBar,
}) => {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            ZMQ Logger
          </Typography>

          <TextField
            label="Port"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            disabled={serverStatus.running}
            inputProps={{ min: 1024, max: 65535 }}
            size="small"
            sx={{ width: 100 }}
          />

          <Button
            variant="contained"
            color={serverStatus.running ? "error" : "success"}
            startIcon={serverStatus.running ? <StopIcon /> : <PlayArrowIcon />}
            onClick={serverStatus.running ? stopServer : startServer}
            size="small"
          >
            {serverStatus.running ? "Stop" : "Start"}
          </Button>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={serverStatus.running ? "Running" : "Stopped"}
              color={serverStatus.running ? "success" : "default"}
              variant="outlined"
              size="small"
            />
            {serverStatus.running && (
              <Typography variant="caption" color="text.secondary">
                port {serverStatus.port}
              </Typography>
            )}
          </Box>

          {/* Received Messages Count in Header */}
          <Badge
            badgeContent={receivedMessagesCount}
            color="primary"
            sx={{ ml: 2 }}
          >
            <Typography variant="body2" color="inherit">
              Messages
            </Typography>
          </Badge>

          {/* Status Message */}
          {statusMessage && (
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                color: statusMessage.includes('Error') ? 'error.light' : 'success.light',
                fontWeight: 'medium'
              }}
            >
              {statusMessage}
            </Typography>
          )}
        </Box>

        {/* Save Logs Button */}
        <IconButton
          color="inherit"
          onClick={onSaveLogs}
          size="small"
          sx={{ mr: 1 }}
          title="Save logs to file"
        >
          <SaveIcon />
        </IconButton>

        {/* Load Logs Button */}
        <IconButton
          color="inherit"
          onClick={onLoadLogs}
          size="small"
          sx={{ mr: 1 }}
          title="Load logs from file"
        >
          <FolderOpenIcon />
        </IconButton>

        {/* Search/Filter Toggle */}
        <IconButton
          color="inherit"
          onClick={() => setShowSearchBar(!showSearchBar)}
          size="small"
          sx={{ mr: 1 }}
          title={showSearchBar ? "隐藏搜索筛选栏" : "显示搜索筛选栏"}
        >
          {showSearchBar ? <SearchOffIcon /> : <SearchIcon />}
        </IconButton>

        {/* Dark Mode Toggle */}
        <IconButton
          color="inherit"
          onClick={() => setDarkMode(!darkMode)}
          size="small"
          sx={{ mr: 1 }}
          title="Toggle dark mode"
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton
          color="inherit"
          onClick={() => setShowSettings(!showSettings)}
          size="small"
          title="Settings"
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
