import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
} from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { LogMessage, LogMessageUtils } from "./types";
import { AppHeader } from "./components/AppHeader";
import { SettingsPage } from "./components/SettingsPage";
import {
  LevelRule,
  RoleRule,
  TagRule,
} from "./types/settings";
import { LogViewer, FilterConfig } from "./components/LogViewer";

interface ServerStatus {
  running: boolean;
  port?: number;
}

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ running: false });
  const [port, setPort] = useState("5555");
  const [receivedMessages, setReceivedMessages] = useState<LogMessage[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [levelRules, setLevelRules] = useState<LevelRule[]>([]);
  const [roleRules, setRoleRules] = useState<RoleRule[]>([]);
  const [tagRules, setTagRules] = useState<TagRule[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sortField, setSortField] = useState("time");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 保存配置到后端存储
  const saveConfigToBackend = async (key: string, value: any) => {
    // 在配置加载完成前不保存
    if (!isConfigLoaded) {
      return;
    }

    try {
      await invoke("save_settings", {
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error(`Error saving ${key} to backend:`, error);
    }
  };

  // 从后端存储加载配置
  const loadConfigFromBackend = async (key: string): Promise<any> => {
    try {
      const result = await invoke("load_settings", { key });
      // 对于数组类型的配置，空数组表示没有数据，应该返回null
      if (result === null || result === undefined) {
        return null;
      }

      const parsed = JSON.parse(result as string);

      // 如果是数组且为空，也视为没有数据
      if (Array.isArray(parsed) && parsed.length === 0) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(`Error loading ${key} from backend:`, error);
      return null;
    }
  };

  // 保存深色模式偏好到后端
  useEffect(() => {
    saveConfigToBackend('darkMode', darkMode);
  }, [darkMode]);

  // 保存配置规则到后端
  useEffect(() => {
    saveConfigToBackend('levelRules', levelRules);
  }, [levelRules]);

  useEffect(() => {
    saveConfigToBackend('roleRules', roleRules);
  }, [roleRules]);

  useEffect(() => {
    saveConfigToBackend('tagRules', tagRules);
  }, [tagRules]);

  // 加载保存的配置规则
  useEffect(() => {
    const loadConfigurations = async () => {
      const savedDarkMode = await loadConfigFromBackend('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode);
      }

      const savedLevelRules = await loadConfigFromBackend('levelRules');
      if (savedLevelRules) {
        setLevelRules(savedLevelRules);
      } 

      const savedRoleRules = await loadConfigFromBackend('roleRules');
      if (savedRoleRules) {
        setRoleRules(savedRoleRules);
      }

      const savedTagRules = await loadConfigFromBackend('tagRules');
      if (savedTagRules) {
        setTagRules(savedTagRules);
      }
      setIsConfigLoaded(true);
    };

    loadConfigurations();
  }, []);

  async function checkServerStatus() {
    try {
      const running = await invoke("get_server_status");
      setServerStatus({ running: running as boolean });
    } catch (error) {
      console.error("Error checking server status:", error);
    }
  }

  async function startServer() {
    try {
      const portNum = parseInt(port);
      if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
        setStatusMessage("Please enter a valid port number (1024-65535)");
        return;
      }

      const result = await invoke("start_zmq_server", { addr: `tcp://127.0.0.1:${portNum}` });
      setStatusMessage(result as string);
      setServerStatus({ running: true, port: portNum });
    } catch (error: any) {
      setStatusMessage(`Error: ${error}`);
    }
  }

  async function stopServer() {
    try {
      const result = await invoke("stop_zmq_server");
      setStatusMessage(result as string);
      setServerStatus({ running: false });
    } catch (error: any) {
      setStatusMessage(`Error: ${error}`);
    }
  }

  async function loadReceivedMessages() {
    try {
      const messages = await invoke("get_received_json");
      setReceivedMessages((messages as string[]).map((m) => LogMessageUtils.parseMessage(m)));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }


  // 保存日志消息到后端
  const saveLogMessages = async () => {
    try {
      if (receivedMessages.length === 0) {
        setStatusMessage("No messages to save");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      const messageStrings = receivedMessages.map(msg =>
        JSON.stringify({
          ...msg,
          messages: msg.messages
        })
      );
      await invoke("save_log_messages", { messages: messageStrings });
      setStatusMessage("Log messages saved successfully");
      setTimeout(() => setStatusMessage(""), 3000);
      console.log("Log messages saved successfully");
    } catch (error) {
      const errorMsg = `Error saving log messages: ${error}`;
      setStatusMessage(errorMsg);
      setTimeout(() => setStatusMessage(""), 5000);
      console.error(errorMsg);
    }
  };

  // 从后端加载日志消息
  const loadLogMessages = async () => {
    try {
      const messages = await invoke("load_latest_log_messages");
      if (messages && Array.isArray(messages)) {
        const parsedMessages = messages.map((msg: string) => {
          try {
            const parsed = JSON.parse(msg);
            return {
              ...parsed,
              messages: Array.isArray(parsed.messages) ? parsed.messages : [parsed.messages]
            };
          } catch {
            return LogMessageUtils.parseMessage(msg);
          }
        });
        setReceivedMessages(parsedMessages);
        setStatusMessage(`Loaded ${parsedMessages.length} log messages`);
        setTimeout(() => setStatusMessage(""), 3000);
        console.log("Log messages loaded successfully");
      } else {
        setStatusMessage("No saved log messages found");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (error) {
      const errorMsg = `Error loading log messages: ${error}`;
      setStatusMessage(errorMsg);
      setTimeout(() => setStatusMessage(""), 5000);
      console.error(errorMsg);
    }
  };

  // 自动保存日志消息（每30秒或当消息数量达到100条时）
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (receivedMessages.length > 0) {
        saveLogMessages();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [receivedMessages.length]);

  // 当消息数量达到100条时自动保存
  useEffect(() => {
    if (receivedMessages.length >= 100) {
      saveLogMessages();
    }
  }, [receivedMessages.length]);

  useEffect(() => {
    checkServerStatus();
    loadReceivedMessages();
    // 应用启动时加载保存的日志消息
    loadLogMessages();

    const unlisten = listen("message-received", (event) => {
      console.log("Received message:", event.payload);
      setReceivedMessages(prev => [...prev, LogMessageUtils.parseMessage(event.payload as string)]);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppHeader
          serverStatus={serverStatus}
          port={port}
          setPort={setPort}
          startServer={startServer}
          stopServer={stopServer}
          receivedMessagesCount={receivedMessages.length}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSaveLogs={saveLogMessages}
          onLoadLogs={loadLogMessages}
          statusMessage={statusMessage}
        />

        {showSettings ? (
          <SettingsPage
            levelRules={levelRules}
            roleRules={roleRules}
            tagRules={tagRules}
            onLevelRulesChange={setLevelRules}
            onRoleRulesChange={setRoleRules}
            onTagRulesChange={setTagRules}
          />
        ) : (
          <Container maxWidth="xl" sx={{
            flex: 1,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {/* Log Viewer Component */}
            <LogViewer
              messages={receivedMessages}
              levelRules={levelRules}
              roleRules={roleRules}
              tagRules={tagRules}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={(field, direction) => {
                setSortField(field);
                setSortDirection(direction);
              }}
            />
          </Container>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
