import { createTheme } from '@mui/material/styles';

// 日志级别颜色映射
export const logLevelColors = {
  DEBUG: '#757575',    // 灰色
  INFO: '#1976d2',     // 蓝色
  WARNING: '#ed6c02',  // 橙色
  ERROR: '#d32f2f',    // 红色
  CRITICAL: '#9a0036', // 深红色
};

// 浅色主题配置
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
});

// 深色主题配置
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
});

// 默认导出浅色主题（向后兼容）
export const theme = lightTheme;

// 日志级别映射表
export const logLevelMap: Record<number, string> = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARNING',
  3: 'ERROR',
  4: 'CRITICAL',
};

// 获取日志级别名称的函数
export const getLevelName = (level: number): string => {
  return logLevelMap[level] || (level <= 1 ? 'DEBUG' : 'INFO');
};

// 获取日志级别颜色的函数
export const getLevelColor = (level: number): string => {
  const levelName = getLevelName(level);
  return logLevelColors[levelName as keyof typeof logLevelColors] || logLevelColors.INFO;
};
