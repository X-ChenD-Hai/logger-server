import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Link,
  Stack,
} from '@mui/material';
import { LogMessage, LogMessageUtils } from '../types';
import {
  applyLevelRulesToChip,
  applyRoleRulesToChip,
  applyLabelRulesToChip,
  getLevelNameFromRules,
  getLevelColorFromRules,
  LevelRule,
  RoleRule,
  TagRule
} from '../types/settings';

interface LogMessageItemProps {
  message: LogMessage;
  levelRules?: LevelRule[];
  roleRules?: RoleRule[];
  tagRules?: TagRule[];
  expanded?: boolean;
  onToggleExpand?: (id: number) => void;
}

export const LogMessageItem: React.FC<LogMessageItemProps> = ({
  message,
  levelRules = [],
  roleRules = [],
  tagRules = [],
}) => {
  const enhancedMessage = LogMessageUtils.enhanceMessage(message);
  const levelName = getLevelNameFromRules(message.level, levelRules);
  const levelColor = getLevelColorFromRules(message.level, levelRules);

  // 应用规则到各个Chip
  const levelChipStyle = applyLevelRulesToChip(message, levelRules);
  const roleChipStyle = applyRoleRulesToChip(message, roleRules);
  const labelChipStyle = applyLabelRulesToChip(message, tagRules);


  const messageStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '0.975rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        borderLeft: `4px solid ${levelColor}`,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" gap={1}>
          <Box flex="1" minWidth={0}>
            {/* 头部信息 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="flex-end" gap={1} mb={1}>
                <Chip
                  label={levelName}
                  size="small"
                  sx={{
                    backgroundColor: levelChipStyle.backgroundColor || levelColor,
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                  }}
                />
                {/* 角色和标签 */}
                {message.role && (
                  <Chip
                    label={`role: ${message.role}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: roleChipStyle.color,
                      borderColor: roleChipStyle.borderColor,
                    }}
                  />
                )}
                {message.label && (
                  <Chip
                    label={`label: ${message.label}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: labelChipStyle.color,
                      borderColor: labelChipStyle.borderColor,
                    }}
                  />
                )}
              </Box>
              {/* 垂直排列 */}
              <Box display="flex" flexDirection="column" gap={1} >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    {enhancedMessage.formattedTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PID: {message.process_id} | TID: {message.thread_id}
                  </Typography>
                </Box>

                {/* 文件信息 */}
                <Box display="flex" alignItems="flex-end" gap={1} mb={1}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    <Link href={`vscode://file/${message.file}:${message.line}`} underline="hover" color="inherit">
                      {enhancedMessage.fileName}:{message.line}
                    </Link>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.function}()
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Divider variant="fullWidth" />

            {/* 消息内容 */}
            <Box sx={{ display: 'flex', overflowX: 'auto' }}>              {message.messages.map((msg, index) => (
              <Typography
                key={index}
                variant="body2"
                component="pre"
                sx={messageStyle}
              >
                {msg}
              </Typography>
            ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
