import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  TextField,
  FormControlLabel,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { RoleRule, PatternMapping, generateId, createRoleRule } from '../types/settings';
import { ActionButtons } from './ActionButtons';

interface RoleConfigPanelProps {
  rules: RoleRule[];
  onRulesChange: (rules: RoleRule[]) => void;
}

export const RoleConfigPanel: React.FC<RoleConfigPanelProps> = ({
  rules,
  onRulesChange,
}) => {
  const [expandedRule, setExpandedRule] = useState<string | false>(false);

  const handleAddRule = () => {
    const newRule = {
      ...createRoleRule(),
      id: generateId(),
    };
    onRulesChange([...rules, newRule]);
    setExpandedRule(newRule.id);
  };

  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
    if (expandedRule === ruleId) {
      setExpandedRule(false);
    }
  };

  const handleMoveRule = (ruleId: string, direction: 'up' | 'down') => {
    const index = rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const newRules = [...rules];
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    onRulesChange(newRules);
  };

  const handleInsertRule = (ruleId: string) => {
    const index = rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return;

    const newRule = {
      ...createRoleRule(),
      id: generateId(),
    };

    const newRules = [...rules];
    newRules.splice(index + 1, 0, newRule);
    onRulesChange(newRules);
    setExpandedRule(newRule.id);
  };

  const handleRuleChange = (ruleId: string, updates: Partial<RoleRule>) => {
    onRulesChange(rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleToggleRule = (ruleId: string) => {
    handleRuleChange(ruleId, { enabled: !rules.find(r => r.id === ruleId)?.enabled });
  };

  const handleAddMapping = (ruleId: string) => {
    const newMapping: PatternMapping = {
      pattern: '',
      type: 'string',
      color: '#000000'
    };
    onRulesChange(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, mappings: [...rule.mappings, newMapping] }
        : rule
    ));
  };

  const handleDeleteMapping = (ruleId: string, index: number) => {
    onRulesChange(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, mappings: rule.mappings.filter((_, i) => i !== index) }
        : rule
    ));
  };

  const handleMoveMapping = (ruleId: string, index: number, direction: 'up' | 'down') => {
    const rule = rules.find(rule => rule.id === ruleId);
    if (!rule || rule.mappings.length <= 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rule.mappings.length) return;

    const newMappings = [...rule.mappings];
    [newMappings[index], newMappings[newIndex]] = [newMappings[newIndex], newMappings[index]];
    
    onRulesChange(rules.map(r =>
      r.id === ruleId ? { ...r, mappings: newMappings } : r
    ));
  };

  const handleInsertMapping = (ruleId: string, index: number) => {
    const newMapping: PatternMapping = {
      pattern: '',
      type: 'string',
      color: '#000000'
    };
    
    onRulesChange(rules.map(rule =>
      rule.id === ruleId
        ? {
            ...rule,
            mappings: [
              ...rule.mappings.slice(0, index + 1),
              newMapping,
              ...rule.mappings.slice(index + 1)
            ]
          }
        : rule
    ));
  };

  const handleMappingChange = (ruleId: string, index: number, updates: Partial<PatternMapping>) => {
    onRulesChange(rules.map(rule =>
      rule.id === ruleId
        ? {
          ...rule,
          mappings: rule.mappings.map((mapping, i) =>
            i === index ? { ...mapping, ...updates } : mapping
          )
        }
        : rule
    ));
  };

  const handleAccordionChange = (ruleId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedRule(isExpanded ? ruleId : false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          角色配置
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRule}
        >
          添加规则
        </Button>
      </Box>

      {rules.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            暂无角色规则，点击"添加规则"开始配置
          </Typography>
        </Paper>
      ) : (
        rules.map((rule) => (
          <Accordion
            key={rule.id}
            expanded={expandedRule === rule.id}
            onChange={handleAccordionChange(rule.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label=""
                />
                <TextField
                  value={rule.name}
                  onChange={(e) => handleRuleChange(rule.id, { name: e.target.value })}
                  placeholder="规则名称"
                  variant="standard"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ mr: 2, minWidth: 200 }}
                />
                <Chip
                  label={rule.enabled ? '已启用' : '已禁用'}
                  color={rule.enabled ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <ActionButtons
                onMoveUp={() => handleMoveRule(rule.id, 'up')}
                onMoveDown={() => handleMoveRule(rule.id, 'down')}
                onInsert={() => handleInsertRule(rule.id)}
                onDelete={() => handleDeleteRule(rule.id)}
                canMoveUp={rules.findIndex(r => r.id === rule.id) > 0}
                canMoveDown={rules.findIndex(r => r.id === rule.id) < rules.length - 1}
              />
            </AccordionSummary>

            <AccordionDetails>
              {rule.mappings.length === 0 && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddMapping(rule.id)}
                    sx={{ mb: 2 }}
                  >
                    添加角色映射
                  </Button>
                </Box>
              )}

              {rule.mappings.map((mapping, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label={mapping.type === 'regex' ? '正则表达式' : '角色模式'}
                      value={mapping.pattern}
                      onChange={(e) => handleMappingChange(rule.id, index, {
                        pattern: e.target.value
                      })}
                      sx={{ flex: 1, minWidth: 200 }}
                      placeholder={mapping.type === 'regex' ? '^admin.*$' : 'admin'}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title={mapping.type === 'regex' ? '切换为字符串匹配' : '切换为正则表达式匹配'}>
                            <IconButton
                              size="small"
                              onClick={() => handleMappingChange(rule.id, index, {
                                type: mapping.type === 'regex' ? 'string' : 'regex'
                              })}
                              sx={{ mr: -1 }}
                            >
                              <CodeIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
                      <PaletteIcon sx={{ mr: 1, color: mapping.color }} />
                      <TextField
                        label="颜色"
                        value={mapping.color}
                        onChange={(e) => handleMappingChange(rule.id, index, {
                          color: e.target.value
                        })}
                        fullWidth
                      />
                    </Box>

                    <ActionButtons
                      onMoveUp={() => handleMoveMapping(rule.id, index, 'up')}
                      onMoveDown={() => handleMoveMapping(rule.id, index, 'down')}
                      onInsert={() => handleInsertMapping(rule.id, index)}
                      onDelete={() => handleDeleteMapping(rule.id, index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < rule.mappings.length - 1}
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}

              {rule.mappings.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  暂无角色映射，点击"添加角色映射"开始配置
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};
