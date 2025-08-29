import { ApiClient } from "../types/api";

export class WebClient implements ApiClient {
  // Web-based configuration storage using localStorage
  async saveSettings(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      throw error;
    }
  }

  async loadSettings(key: string): Promise<any> {
    try {
      const result = localStorage.getItem(key);
      if (result === null) {
        return null;
      }

      const parsed = JSON.parse(result);
      
      // For array types, empty array means no data, return null
      if (Array.isArray(parsed) && parsed.length === 0) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return null;
    }
  }

  // Web-based server simulation
  async getServerStatus(): Promise<boolean> {
    // Simulate server status check for web version
    return false;
  }

  async startZmqServer(addr: string): Promise<string> {
    // Simulate server start for web version
    const port = addr.split(':').pop();
    return `Server started on port ${port} (Web Simulation)`;
  }

  async stopZmqServer(): Promise<string> {
    // Simulate server stop for web version
    return "Server stopped (Web Simulation)";
  }

  async getReceivedJson(): Promise<string[]> {
    // Return empty array for web version - messages are simulated elsewhere
    return [];
  }

  async saveLogMessages(messages: string[]): Promise<void> {
    // Save to localStorage for web version
    await this.saveSettings('logMessages', messages);
  }

  async loadLatestLogMessages(): Promise<string[]> {
    // Load from localStorage for web version
    const messages = await this.loadSettings('logMessages');
    return messages || [];
  }

  async onMessageReceived(_callback: (message: string) => void): Promise<void> {
    // For web version, we can simulate message reception
    // This could be connected to a WebSocket or other real-time mechanism
    console.log("Message reception not implemented for Web yet");
  }

  offMessageReceived(): void {
    console.log("Message reception not implemented for Web yet");
  }

  async clearLogMessages(): Promise<void> {
    localStorage.removeItem('logMessages');
  }
}
