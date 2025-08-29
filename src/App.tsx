import { useState, useEffect, useRef } from "react";
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
import { ApiClient, ServerStatus } from "./types/api";
import { TauriClient } from "./api/tauriClient";
import { WebClient } from "./api/webClient";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sortField, setSortField] = useState("time");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Initialize API client - use ref to prevent recreation on every render
  const apiClientRef = useRef<ApiClient | null>(null);
  if (!apiClientRef.current) {
    console.log("Creating new API client instance");
    apiClientRef.current = new TauriClient();
  }
  const apiClient = apiClientRef.current;


  // Load saved configuration rules using API client
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoadingSettings(true);

        const savedDarkMode = await apiClient.loadSettings('darkMode');
        if (savedDarkMode !== null) {
          setDarkMode(savedDarkMode);
        }

        const savedLevelRules = await apiClient.loadSettings('levelRules');
        if (savedLevelRules) {
          setLevelRules(savedLevelRules);
        }

        const savedRoleRules = await apiClient.loadSettings('roleRules');
        if (savedRoleRules) {
          setRoleRules(savedRoleRules);
        }

        const savedTagRules = await apiClient.loadSettings('tagRules');
        if (savedTagRules) {
          setTagRules(savedTagRules);
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadConfig();
  }, [apiClient]);

  // Save dark mode preference using API client (only after initial load)
  useEffect(() => {
    if (!isLoadingSettings) {
      apiClient.saveSettings('darkMode', darkMode);
    }
  }, [darkMode, apiClient, isLoadingSettings]);

  // Save configuration rules using API client (only after initial load)
  useEffect(() => {
    if (!isLoadingSettings) {
      apiClient.saveSettings('levelRules', levelRules);
    }
  }, [levelRules, apiClient, isLoadingSettings]);

  useEffect(() => {
    if (!isLoadingSettings) {
      apiClient.saveSettings('roleRules', roleRules);
    }
  }, [roleRules, apiClient, isLoadingSettings]);

  useEffect(() => {
    if (!isLoadingSettings) {
      apiClient.saveSettings('tagRules', tagRules);
    }
  }, [tagRules, apiClient, isLoadingSettings]);

  // Server functions using API client
  const checkServerStatus = async () => {
    try {
      const running = await apiClient.getServerStatus();
      setServerStatus({ running });
    } catch (error) {
      console.error("Error checking server status:", error);
      setServerStatus({ running: false });
    }
  };

  const startServer = async () => {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
      setStatusMessage("Please enter a valid port number (1024-65535)");
      return;
    }

    try {
      const addr = `tcp://*:${portNum}`;
      const result = await apiClient.startZmqServer(addr);
      setStatusMessage(result);
      setServerStatus({ running: true, port: portNum });

      // For web version, simulate receiving messages
      if (apiClient instanceof WebClient) {
        setTimeout(() => {
          const sampleMessages = [
            '{"time": 1735478400, "level": 1, "process_id": 1234, "thread_id": 5678, "file": "main.cpp", "line": 42, "function": "main", "messages": ["Application started successfully"]}',
            '{"time": 1735478401, "level": 2, "process_id": 1234, "thread_id": 5678, "file": "utils.cpp", "line": 15, "function": "processData", "messages": ["Processing data batch 1"]}',
            '{"time": 1735478402, "level": 3, "process_id": 1234, "thread_id": 5679, "file": "network.cpp", "line": 88, "function": "connect", "messages": ["Connected to server", "Connection established"]}'
          ];

          const parsedMessages = sampleMessages.map(msg => LogMessageUtils.parseMessage(msg));
          setReceivedMessages(prev => [...prev, ...parsedMessages]);
        }, 1000);
      }
    } catch (error) {
      const errorMsg = `Error starting server: ${error}`;
      setStatusMessage(errorMsg);
      console.error(errorMsg);
    }
  };

  const stopServer = async () => {
    try {
      const result = await apiClient.stopZmqServer();
      setStatusMessage(result);
      setServerStatus({ running: false });
    } catch (error) {
      const errorMsg = `Error stopping server: ${error}`;
      setStatusMessage(errorMsg);
      console.error(errorMsg);
    }
  };

  // Log message functions using API client
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

      await apiClient.saveLogMessages(messageStrings);
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

  const loadLogMessages = async () => {
    try {
      const messages = await apiClient.loadLatestLogMessages();
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

  const clearLogMessages = async () => {
    try {
      await apiClient.clearLogMessages();
      setReceivedMessages([]);
      setStatusMessage("All logs cleared successfully");
      setTimeout(() => setStatusMessage(""), 3000);
      console.log("All logs cleared successfully");
    } catch (error) {
      const errorMsg = `Error clearing log messages: ${error}`;
      setStatusMessage(errorMsg);
      setTimeout(() => setStatusMessage(""), 5000);
      console.error(errorMsg);
    }
  };

  // Auto-save log messages (every 30 seconds or when message count reaches 100)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (receivedMessages.length > 0) {
        saveLogMessages();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [receivedMessages.length]);

  // Auto-save when message count reaches 100
  useEffect(() => {
    if (receivedMessages.length >= 100) {
      saveLogMessages();
    }
  }, [receivedMessages.length]);

  // Use a ref to track if we've already set up message reception
  const messageReceptionSetUp = useRef(false);

  // Set up message reception callback only once
  useEffect(() => {
    const setupMessageReception = async () => {
      console.log("Setting up message reception callback...");
      await apiClient.onMessageReceived((message: string) => {
        console.log("Message received in App callback:", message);
        try {
          const parsedMessage = LogMessageUtils.parseMessage(message);
          setReceivedMessages(prev => [...prev, parsedMessage]);
        } catch (error) {
          messageReceptionSetUp.current = false;
          console.error("Error parsing received message:", error, message);
        }
      });

    };
    if (!messageReceptionSetUp.current) {
      messageReceptionSetUp.current = true;
      setupMessageReception();
    }
  }, [apiClient]);

  // Initialize app - load settings and check server status
  useEffect(() => {
    const initializeApp = async () => {
      await checkServerStatus();
      // Load saved log messages on app start
      await loadLogMessages();
    };

    initializeApp();
  }, [apiClient]);

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
          onClearLogs={clearLogMessages}
          statusMessage={statusMessage}
          showSearchBar={showSearchBar}
          setShowSearchBar={setShowSearchBar}
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
              showSearchBar={showSearchBar}
            />
          </Container>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
