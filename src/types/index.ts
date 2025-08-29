/**
 * Log message interface representing the structure received from ZMQ logger
 */
export interface LogMessage {
  /** Role/type of the data */
  role: string;

  /** Additional labeling information */
  label: string;

  /** File path where the log originated */
  file: string;

  /** Function/method name where the log was generated */
  function: string;

  /** Timestamp (Unix timestamp or similar) */
  time: number;

  /** Process ID */
  process_id: number;

  /** Thread ID */
  thread_id: number;

  /** Line number in the source file */
  line: number;

  /** Log level (0 = DEBUG/INFO, higher numbers may indicate more severe levels) */
  level: number;

  /** Array of log messages */
  messages: string[];
}

/**
 * Log level enum for better type safety
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * Extended log message with parsed level and formatted timestamp
 */
export interface EnhancedLogMessage extends LogMessage {
  /** Parsed log level as enum */
  levelName: keyof typeof LogLevel;

  /** Formatted timestamp string */
  formattedTime: string;

  /** File name extracted from full path */
  fileName: string;
}

/**
 * Utility functions for working with log messages
 */
export const LogMessageUtils = {
  /**
   * Parse a JSON string into a LogMessage object
   */
  parseMessage(jsonString: string): LogMessage {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        role: parsed.role || '',
        label: parsed.label || '',
        file: parsed.file || '',
        function: parsed.function || '',
        time: parsed.time || 0,
        process_id: parsed.process_id || 0,
        thread_id: parsed.thread_id || 0,
        line: parsed.line || 0,
        level: parsed.level || 0,
        messages: Array.isArray(parsed.messages) ? parsed.messages : [parsed.messages || '']
      };
    } catch (error) {
      console.error('Failed to parse log message:', error);
      return this.createDefaultMessage(jsonString);
    }
  },

  /**
   * Create a default log message from raw string
   */
  createDefaultMessage(rawMessage: string): LogMessage {
    return {
      role: 'unknown',
      label: 'raw',
      file: '',
      function: '',
      time: Date.now(),
      process_id: 0,
      thread_id: 0,
      line: 0,
      level: 0,
      messages: [rawMessage]
    };
  },

  /**
   * Enhance a log message with additional parsed information
   */
  enhanceMessage(message: LogMessage): EnhancedLogMessage {
    const levelName = this.getLevelName(message.level);
    const formattedTime = this.formatTimestamp(message.time);
    const fileName = this.extractFileName(message.file);

    return {
      ...message,
      levelName,
      formattedTime,
      fileName
    };
  },

  /**
   * Get level name from level number
   */
  getLevelName(level: number): keyof typeof LogLevel {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARNING: return 'WARNING';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.CRITICAL: return 'CRITICAL';
      default: return level <= LogLevel.INFO ? 'DEBUG' : 'INFO';
    }
  },

  /**
   * Format timestamp to readable string
   */
  formatTimestamp(timestamp: number): string {
    // Assuming timestamp is in milliseconds
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },

  /**
   * Extract file name from full path
   */
  extractFileName(filePath: string): string {
    if (!filePath) return '';
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1] || filePath;
  },

  /**
   * Check if a string is a valid JSON log message
   */
  isValidLogMessage(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'object' &&
        typeof parsed.role === 'string' &&
        typeof parsed.label === 'string' &&
        Array.isArray(parsed.messages);
    } catch {
      return false;
    }
  }
};
