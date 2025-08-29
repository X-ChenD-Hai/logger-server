import React, { useState } from 'react';
import {
  Drawer,
  Container,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Assessment as LevelIcon,
  People as RoleIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { ConfigType, LevelRule, RoleRule, TagRule } from '../types/settings';
import { LevelConfigPanel } from './LevelConfigPanel';
import { RoleConfigPanel } from './RoleConfigPanel';
import { TagConfigPanel } from './TagConfigPanel';

interface SettingsPageProps {
  levelRules: LevelRule[];
  roleRules: RoleRule[];
  tagRules: TagRule[];
  onLevelRulesChange: (rules: LevelRule[]) => void;
  onRoleRulesChange: (rules: RoleRule[]) => void;
  onTagRulesChange: (rules: TagRule[]) => void;
}

const drawerWidth = 240;

export const SettingsPage: React.FC<SettingsPageProps> = ({
  levelRules,
  roleRules,
  tagRules,
  onLevelRulesChange,
  onRoleRulesChange,
  onTagRulesChange,
}) => {
  const theme = useTheme();
  const [activeConfig, setActiveConfig] = useState<ConfigType>('levels');

  const menuItems = [
    { id: 'levels' as ConfigType, label: '日志等级配置', icon: <LevelIcon /> },
    { id: 'roles' as ConfigType, label: '角色配置', icon: <RoleIcon /> },
    { id: 'tags' as ConfigType, label: '标签配置', icon: <TagIcon /> },
  ];

  const renderContent = () => {
    switch (activeConfig) {
      case 'levels':
        return (
          <LevelConfigPanel
            rules={levelRules}
            onRulesChange={onLevelRulesChange}
          />
        );
      case 'roles':
        return (
          <RoleConfigPanel
            rules={roleRules}
            onRulesChange={onRoleRulesChange}
          />
        );
      case 'tags':
        return (
          <TagConfigPanel
            rules={tagRules}
            onRulesChange={onTagRulesChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* 左侧边栏 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            配置设置
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={activeConfig === item.id}
              onClick={() => setActiveConfig(item.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* 右侧内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};
