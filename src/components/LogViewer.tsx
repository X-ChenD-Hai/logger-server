import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { LogMessageItem } from './LogMessageItem';
import { LogMessage } from '../types';
import { LevelRule, RoleRule, TagRule } from '../types/settings';

export interface FilterConfig {
  field: string;
  value: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

interface LogViewerProps {
  messages: LogMessage[];
  levelRules: LevelRule[];
  roleRules: RoleRule[];
  tagRules: TagRule[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  showSearchBar: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  messages,
  levelRules,
  roleRules,
  tagRules,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortField,
  sortDirection,
  onSortChange,
  showSearchBar,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filterField, setFilterField] = useState('messages');
  const [filterValue, setFilterValue] = useState('');
  const [filterOperator, setFilterOperator] = useState<'contains' | 'equals' | 'startsWith' | 'endsWith'>('contains');

  const getFieldValue = (message: LogMessage, field: string): any => {
    switch (field) {
      case 'time':
        return message.time;
      case 'level':
        return message.level;
      case 'process_id':
        return message.process_id;
      case 'thread_id':
        return message.thread_id;
      case 'file':
        return message.file;
      case 'line':
        return message.line;
      case 'function':
        return message.function || '';
      case 'role':
        return message.role || '';
      case 'label':
        return message.label || '';
      case 'messages':
        return message.messages.join(' ');
      default:
        return '';
    }
  };

  // Filter and sort messages based on current configuration
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages.filter(message => {
      // Full-text search across all message content
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const messageText = message.messages.join(' ').toLowerCase();
        const fileInfo = `${message.file}:${message.line}`.toLowerCase();
        const functionInfo = message.function?.toLowerCase() || '';
        
        if (!messageText.includes(searchLower) && 
            !fileInfo.includes(searchLower) && 
            !functionInfo.includes(searchLower)) {
          return false;
        }
      }

      // Apply field-specific filters
      return filters.every(filter => {
        const fieldValue = getFieldValue(message, filter.field)?.toString().toLowerCase() || '';
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case 'contains':
            return fieldValue.includes(filterValue);
          case 'equals':
            return fieldValue === filterValue;
          case 'startsWith':
            return fieldValue.startsWith(filterValue);
          case 'endsWith':
            return fieldValue.endsWith(filterValue);
          default:
            return true;
        }
      });
    });

    // Sort messages
    filtered.sort((a, b) => {
      const aValue = getFieldValue(a, sortField);
      const bValue = getFieldValue(b, sortField);

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return filtered;
  }, [messages, searchQuery, filters, sortField, sortDirection]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    onSearchChange(localSearch);
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const handleAddFilter = (field: string, value: string, operator: 'contains' | 'equals' | 'startsWith' | 'endsWith') => {
    const newFilter: FilterConfig = { field, value, operator };
    onFiltersChange([...filters, newFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  // Extract unique values from messages for the selected field
  const getFieldSuggestions = useMemo(() => {
    const values = new Set<string>();
    messages.forEach(message => {
      const value = getFieldValue(message, filterField);
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  }, [messages, filterField]);

  const sortableFields = [
    { value: 'time', label: '时间' },
    { value: 'level', label: '等级' },
    { value: 'process_id', label: '进程ID' },
    { value: 'thread_id', label: '线程ID' },
    { value: 'file', label: '文件' },
    { value: 'function', label: '函数' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Search and Filter Controls */}
      {showSearchBar && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <TextField
              placeholder="搜索日志内容..."
              value={localSearch}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: localSearch && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClear}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ minWidth: 300 }}
            />

            {/* Sort Control */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>排序字段</InputLabel>
              <Select
                value={sortField}
                label="排序字段"
                onChange={(e: SelectChangeEvent) => handleSortChange(e.target.value)}
              >
                {sortableFields.map((field) => (
                  <MenuItem key={field.value} value={field.value}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Direction Toggle */}
            <IconButton
              onClick={() => handleSortChange(sortField)}
              title={sortDirection === 'asc' ? '升序' : '降序'}
            >
              {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>

            {/* Filter Toggle */}
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={filters.length > 0 ? 'primary' : 'default'}
              title="显示筛选器"
            >
              <FilterListIcon />
            </IconButton>

            {/* Results Count */}
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedMessages.length} / {messages.length} 条日志
            </Typography>
          </Box>

          {/* Filter Panel */}
          {showFilters && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                添加筛选器
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>字段</InputLabel>
                  <Select
                    value={filterField}
                    label="字段"
                    onChange={(e: SelectChangeEvent) => setFilterField(e.target.value)}
                  >
                    <MenuItem value="messages">消息内容</MenuItem>
                    <MenuItem value="file">文件</MenuItem>
                    <MenuItem value="function">函数</MenuItem>
                    <MenuItem value="level">等级</MenuItem>
                    <MenuItem value="process_id">进程ID</MenuItem>
                    <MenuItem value="thread_id">线程ID</MenuItem>
                    <MenuItem value="role">角色</MenuItem>
                    <MenuItem value="label">标签</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>操作符</InputLabel>
                  <Select
                    value={filterOperator}
                    label="操作符"
                    onChange={(e: SelectChangeEvent) => setFilterOperator(e.target.value as any)}
                  >
                    <MenuItem value="contains">包含</MenuItem>
                    <MenuItem value="equals">等于</MenuItem>
                    <MenuItem value="startsWith">开头为</MenuItem>
                    <MenuItem value="endsWith">结尾为</MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  freeSolo
                  options={getFieldSuggestions}
                  value={filterValue}
                  onChange={(_, newValue) => setFilterValue(newValue || '')}
                  onInputChange={(_, newInputValue) => setFilterValue(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="值"
                      size="small"
                      sx={{ minWidth: 200 }}
                    />
                  )}
                />

                <Button
                  variant="outlined"
                  onClick={() => {
                    if (filterValue.trim()) {
                      handleAddFilter(filterField, filterValue, filterOperator);
                      setFilterValue('');
                    }
                  }}
                  disabled={!filterValue.trim()}
                >
                  添加筛选
                </Button>
              </Box>
            </Box>
          )}

          {/* Active Filters */}
          {filters.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.map((filter, index) => (
                <Chip
                  key={index}
                  label={`${filter.field}: ${filter.value}`}
                  onDelete={() => handleRemoveFilter(index)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Log Messages */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box className="log-container" sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {filteredAndSortedMessages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              {messages.length === 0 ? '暂无日志消息' : '没有找到匹配的日志消息'}
            </Typography>
          ) : (
            filteredAndSortedMessages.map((message, index) => (
              <LogMessageItem
                key={index}
                message={message}
                levelRules={levelRules}
                roleRules={roleRules}
                tagRules={tagRules}
              />
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
};
