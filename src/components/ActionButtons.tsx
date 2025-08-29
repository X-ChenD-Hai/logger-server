import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ActionButtonsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInsert?: () => void;
  onDelete?: (e?: React.MouseEvent) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  size?: 'small' | 'medium';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onMoveUp,
  onMoveDown,
  onInsert,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  size = 'small',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onMoveUp && (
        <Tooltip title="上移">
          <span>
            <IconButton
              size={size}
              onClick={onMoveUp}
              disabled={!canMoveUp}
            >
              <ArrowUpwardIcon fontSize={size} />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {onMoveDown && (
        <Tooltip title="下移">
          <span>
            <IconButton
              size={size}
              onClick={onMoveDown}
              disabled={!canMoveDown}
            >
              <ArrowDownwardIcon fontSize={size} />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {onInsert && (
        <Tooltip title="在下方插入">
          <IconButton size={size} onClick={onInsert}>
            <AddIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="删除">
          <IconButton size={size} onClick={onDelete} color="error">
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
