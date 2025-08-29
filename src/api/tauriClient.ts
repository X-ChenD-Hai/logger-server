import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ApiClient } from "../types/api";

export class TauriClient implements ApiClient {
  private messageListener: any = null;
  async saveSettings(key: string, value: any): Promise<void> {
    await invoke("save_settings", {
      key,
      value: JSON.stringify(value)
    });
  }

  async loadSettings(key: string): Promise<any> {
    try {
      const result = await invoke("load_settings", { key });
      if (result === null || result === undefined) {
        return null;
      }

      const parsed = JSON.parse(result as string);

      // For array types, empty array means no data, return null
      if (Array.isArray(parsed) && parsed.length === 0) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(`Error loading ${key} from backend:`, error);
      return null;
    }
  }

  async getServerStatus(): Promise<boolean> {
    return await invoke("get_server_status") as boolean;
  }

  async startZmqServer(addr: string): Promise<string> {
    return await invoke("start_zmq_server", { addr }) as string;
  }

  async stopZmqServer(): Promise<string> {
    return await invoke("stop_zmq_server") as string;
  }

  async getReceivedJson(): Promise<string[]> {
    return await invoke("get_received_json") as string[];
  }

  async saveLogMessages(messages: string[]): Promise<void> {
    await invoke("save_log_messages", { messages });
  }

  async loadLatestLogMessages(): Promise<string[]> {
    return await invoke("load_latest_log_messages") as string[];
  }

  async onMessageReceived(callback: (message: string) => void): Promise<void> {
    try {
      // Clean up any existing listener
      this.offMessageReceived();

      // Set up event listener for "message-received" events from the backend
      this.messageListener = await listen<string>('message-received', (event) => {
        console.log("Received message via Tauri event:", event.payload);
        callback(event.payload);
      });

      console.log("Message reception listener registered - listener count:", this.messageListener ? 1 : 0);
    } catch (error) {
      console.error("Error setting up message reception:", error);
    }
  }

  offMessageReceived(): void {
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = null;
      console.log("Message reception listener removed");
    }
  }

  async clearLogMessages(): Promise<void> {
    await invoke("clear_log_messages");
  }
}
