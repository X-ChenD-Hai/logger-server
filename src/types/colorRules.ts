import { LogMessage } from './index';

// 条件操作符类型
export type ConditionOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';

// 条件接口
export interface ColorCondition {
  field: keyof LogMessage;
  operator: ConditionOperator;
  value: string;
}

// 样式接口
export interface ColorStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

// 颜色规则接口
export interface ColorRule {
  id: string;
  name: string;
  condition: ColorCondition;
  style: ColorStyle;
  enabled: boolean
}



// 检查条件是否匹配
export const matchCondition = (message: LogMessage, condition: ColorCondition): boolean => {
  const fieldValue = message[condition.field]?.toString() || '';
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'contains':
      return fieldValue.includes(condition.value);
    case 'startsWith':
      return fieldValue.startsWith(condition.value);
    case 'endsWith':
      return fieldValue.endsWith(condition.value);
    case 'regex':
      try {
        return new RegExp(condition.value).test(fieldValue);
      } catch {
        return false;
      }
    default:
      return false;
  }
};

// 应用颜色规则到消息
export const applyColorRules = (message: LogMessage, rules: ColorRule[]): ColorStyle => {
  const enabledRules = rules.filter(rule => rule.enabled);
  
  for (const rule of enabledRules) {
    if (matchCondition(message, rule.condition)) {
      return rule.style;
    }
  }
  
  return {};
};

// 创建新的颜色规则
export const createColorRule = (): Omit<ColorRule, 'id'> => {
  return {
    name: '新规则',
    condition: {
      field: 'role',
      operator: 'equals',
      value: ''
    },
    style: {
      color: '#000000'
    },
    enabled: true
  };
};

// 验证颜色规则
export const validateColorRule = (rule: ColorRule): string[] => {
  const errors: string[] = [];
  
  if (!rule.name.trim()) {
    errors.push('规则名称不能为空');
  }
  
  if (!rule.condition.value.trim()) {
    errors.push('条件值不能为空');
  }
  
  if (rule.condition.operator === 'regex') {
    try {
      new RegExp(rule.condition.value);
    } catch {
      errors.push('正则表达式格式无效');
    }
  }
  
  return errors;
};
