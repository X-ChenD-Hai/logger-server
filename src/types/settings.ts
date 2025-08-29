import { LogMessage } from ".";

// 日志等级映射接口
export interface LevelMapping {
  level: number;
  name: string;
  color: string;
}

// 日志等级规则接口
export interface LevelRule {
  id: string;
  name: string; // 规则别名
  mappings: LevelMapping[];
  enabled: boolean;
}

// 模式类型
export type PatternType = 'string' | 'regex';

// 模式映射接口
export interface PatternMapping {
  pattern: string;
  type: PatternType;
  color: string;
}

// 角色规则接口
export interface RoleRule {
  id: string;
  name: string;
  mappings: PatternMapping[];
  enabled: boolean;
}

// 标签规则接口
export interface TagRule {
  id: string;
  name: string;
  mappings: PatternMapping[];
  enabled: boolean;
}

// 配置类型
export type ConfigType = 'levels' | 'roles' | 'tags';

// 默认日志等级规则
export const defaultLevelRules: LevelRule[] = [
  {
    id: 'default-levels',
    name: '默认日志等级',
    enabled: true,
    mappings: [
      { level: 0, name: 'TRACE', color: '#9e9e9e' },
      { level: 1, name: 'DEBUG', color: '#2196f3' },
      { level: 2, name: 'WARNING', color: '#ff9800' },
      { level: 3, name: 'ERROR', color: '#f44336' },
      { level: 4, name: 'CRITICAL', color: '#d32f2f' }
    ]
  }
];

// 默认角色规则
export const defaultRoleRules: RoleRule[] = [
  {
    id: 'default-roles',
    name: '默认角色',
    enabled: true,
    mappings: [
      { pattern: 'admin', type: 'string', color: '#ff5722' },
      { pattern: 'user', type: 'string', color: '#4caf50' },
      { pattern: 'system', type: 'string', color: '#673ab7' }
    ]
  }
];

// 默认标签规则
export const defaultTagRules: TagRule[] = [
  {
    id: 'default-tags',
    name: '默认标签',
    enabled: true,
    mappings: [
      { pattern: 'important', type: 'string', color: '#ffeb3b' },
      { pattern: 'notification', type: 'string', color: '#00bcd4' },
      { pattern: 'security', type: 'string', color: '#e91e63' }
    ]
  }
];

// 创建新的日志等级规则
export const createLevelRule = (): Omit<LevelRule, 'id'> => {
  return {
    name: '新日志等级规则',
    mappings: [
      { level: 0, name: 'TRACE', color: '#9e9e9e' },
      { level: 1, name: 'DEBUG', color: '#2196f3' }
    ],
    enabled: false
  };
};

// 创建新的角色规则
export const createRoleRule = (): Omit<RoleRule, 'id'> => {
  return {
    name: '新角色规则',
    mappings: [
      { pattern: '', type: 'string', color: '#000000' }
    ],
    enabled: true
  };
};

// 创建新的标签规则
export const createTagRule = (): Omit<TagRule, 'id'> => {
  return {
    name: '新标签规则',
    mappings: [
      { pattern: '', type: 'string', color: '#000000' }
    ],
    enabled: true
  };
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 验证日志等级规则
export const validateLevelRule = (rule: LevelRule): string[] => {
  const errors: string[] = [];

  if (!rule.name.trim()) {
    errors.push('规则名称不能为空');
  }

  if (rule.mappings.length === 0) {
    errors.push('至少需要一个等级映射');
  }

  const levelSet = new Set<number>();
  for (const mapping of rule.mappings) {
    if (levelSet.has(mapping.level)) {
      errors.push(`等级 ${mapping.level} 重复`);
    }
    levelSet.add(mapping.level);

    if (!mapping.name.trim()) {
      errors.push('等级名称不能为空');
    }

    if (!mapping.color) {
      errors.push('等级颜色不能为空');
    }
  }

  return errors;
};

// 验证模式规则（角色/标签）
export const validatePatternRule = (rule: RoleRule | TagRule): string[] => {
  const errors: string[] = [];

  if (!rule.name.trim()) {
    errors.push('规则名称不能为空');
  }

  if (rule.mappings.length === 0) {
    errors.push('至少需要一个模式映射');
  }

  for (const mapping of rule.mappings) {
    if (!mapping.pattern.trim()) {
      errors.push('模式不能为空');
    }

    if (mapping.type === 'regex') {
      try {
        new RegExp(mapping.pattern);
      } catch {
        errors.push('正则表达式格式无效');
      }
    }

    if (!mapping.color) {
      errors.push('颜色不能为空');
    }
  }

  return errors;
};

// 模式匹配辅助函数
const matchesPattern = (value: string, mapping: PatternMapping): boolean => {
  if (!value) return false;

  if (mapping.type === 'regex') {
    try {
      return new RegExp(mapping.pattern).test(value);
    } catch {
      return false;
    }
  }
  return value.includes(mapping.pattern);
};

// 从启用的规则中获取等级名称
export const getLevelNameFromRules = (level: number, rules: LevelRule[]): string => {
  const enabledRule = rules.find(rule => rule.enabled);
  if (!enabledRule) return getDefaultLevelName(level);
  const mapping = enabledRule.mappings.find(m => m.level === level);
  return mapping ? mapping.name : getDefaultLevelName(level);
};

// 从启用的规则中获取等级颜色
export const getLevelColorFromRules = (level: number, rules: LevelRule[]): string => {
  const enabledRule = rules.find(rule => rule.enabled);
  if (!enabledRule) return getDefaultLevelColor(level);
  const mapping = enabledRule.mappings.find(m => m.level === level);
  return mapping ? mapping.color : getDefaultLevelColor(level);
};

// 默认等级名称（向后兼容）
const getDefaultLevelName = (level: number): string => {
  const logLevelMap: Record<number, string> = {
    0: 'TRACE',
    1: 'DEBUG',
    2: 'WARNING',
    3: 'ERROR',
    4: 'CRITICAL',
  };
  return logLevelMap[level] || (level <= 1 ? 'DEBUG' : 'INFO');
};

// 默认等级颜色（向后兼容）
const getDefaultLevelColor = (level: number): string => {
  const levelName = getDefaultLevelName(level);
  const logLevelColors = {
    TRACE: '#9e9e9e',
    DEBUG: '#2196f3',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    CRITICAL: '#d32f2f',
  };
  return logLevelColors[levelName as keyof typeof logLevelColors] || logLevelColors.DEBUG;
};

// 应用日志等级规则到等级Chip
export const applyLevelRulesToChip = (message: LogMessage, rules: LevelRule[]): { backgroundColor?: string } => {
  const enabledRule = rules.find(rule => rule.enabled);
  if (!enabledRule) return {};
  const mapping = enabledRule.mappings.find(m => m.level === message.level);
  return mapping ? { backgroundColor: mapping.color } : {};
};

// 应用角色规则到角色Chip
export const applyRoleRulesToChip = (message: LogMessage, rules: RoleRule[]): { color?: string, borderColor?: string } => {
  const enabledRules = rules.filter(rule => rule.enabled);
  for (const rule of enabledRules) {
    for (const mapping of rule.mappings) {
      if (matchesPattern(message.role || '', mapping)) {
        return { color: mapping.color, borderColor: mapping.color };
      }
    }
  }
  return {};
};

// 应用标签规则到标签Chip
export const applyLabelRulesToChip = (message: LogMessage, rules: TagRule[]): { color?: string, borderColor?: string } => {
  const enabledRules = rules.filter(rule => rule.enabled);
  for (const rule of enabledRules) {
    for (const mapping of rule.mappings) {
      if (matchesPattern(message.label || '', mapping)) {
        return { color: mapping.color, borderColor: mapping.color };
      }
    }
  }
  return {};
};
