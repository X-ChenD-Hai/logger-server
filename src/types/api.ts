export interface ServerStatus {
  running: boolean;
  port?: number;
}

export interface ApiClient {
  // Configuration methods
  saveSettings(key: string, value: any): Promise<void>;
  loadSettings(key: string): Promise<any>;
  
  // Server methods
  getServerStatus(): Promise<boolean>;
  startZmqServer(addr: string): Promise<string>;
  stopZmqServer(): Promise<string>;
  
  // Message methods
  getReceivedJson(): Promise<string[]>;
  saveLogMessages(messages: string[]): Promise<void>;
  loadLatestLogMessages(): Promise<string[]>;
  
  // Real-time message reception
  onMessageReceived(callback: (message: string) => void): Promise<void>;
  offMessageReceived(): void;
  
  // Clear logs
  clearLogMessages(): Promise<void>;
}
