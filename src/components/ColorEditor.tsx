import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Popover,
  IconButton,
  Paper,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';

interface ColorEditorProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export const ColorEditor: React.FC<ColorEditorProps> = ({
  value,
  onChange,
  label = '颜色',
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempColor, setTempColor] = useState(value);
  const textFieldRef = useRef<HTMLDivElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
    setTempColor(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onChange(tempColor);
    handleClose();
  };

  const handleCancel = () => {
    setTempColor(value);
    handleClose();
  };

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTempColor(newValue);
    // Also update the parent if it's a valid color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-picker-popover' : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <TextField
        ref={textFieldRef}
        label={label}
        value={tempColor}
        onChange={handleInputChange}
        fullWidth
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <IconButton
              size="small"
              onClick={handleOpen}
              disabled={disabled}
              sx={{ 
                mr: 1,
                backgroundColor: value,
                color: '#fff',
                border: `1px solid ${value}`,
                '&:hover': {
                  backgroundColor: value,
                  opacity: 0.8,
                },
              }}
            >
              <PaletteIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
            borderRadius: 2,
          },
        }}
      >
        <ClickAwayListener onClickAway={handleCancel}>
          <Paper sx={{ p: 2, minWidth: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">选择颜色</Typography>
              <Box>
                <IconButton
                  size="small"
                  onClick={handleApply}
                  sx={{ color: 'success.main' }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  sx={{ color: 'error.main' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <HexColorPicker
              color={tempColor}
              onChange={handleColorChange}
              style={{ width: '100%', height: 200, marginBottom: 16 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: tempColor,
                  borderRadius: 1,
                  border: '1px solid #ccc',
                }}
              />
              <TextField
                value={tempColor}
                onChange={handleInputChange}
                size="small"
                sx={{ flex: 1 }}
                placeholder="#000000"
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              当前颜色: {tempColor}
            </Typography>
          </Paper>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
};
