use chrono::Local;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreBuilder;

#[tauri::command]
pub async fn save_settings(
    app_handle: tauri::AppHandle,
    key: String,
    value: String,
) -> Result<(), String> {
    println!("save_settings key: {}, value: {}", key, value);
    let store = StoreBuilder::new(&app_handle, "settings.dat")
        .build()
        .map_err(|e| {
            println!("save_settings: {}", e);
            e.to_string()
        })?;

    store.set(key, serde_json::Value::String(value));
    store.save().map_err(|e| {
        println!("save_settings: {}", e);
        e.to_string()
    })?;
    Ok(())
}

#[tauri::command]
pub async fn load_settings(
    app_handle: tauri::AppHandle,
    key: String,
) -> Result<Option<String>, String> {
    println!("load_settings key: {}", key);
    let store = StoreBuilder::new(&app_handle, "settings.dat")
        .build()
        .map_err(|e| e.to_string())?;
    Ok(store.get(&key).and_then(|v| {
        v.as_str().map(|s| {
            println!("load_settings: {}", s);
            s.to_string()
        })
    }))
}

// ---------------- Log messages persistence ----------------
#[tauri::command]
pub async fn save_log_messages(app_handle: AppHandle, messages: Vec<String>) -> Result<(), String> {
    println!("save_log_messages");
    match app_handle.path().data_dir() {
        Err(_) => return Err("无法获取应用数据目录".to_string()),
        Ok(data_dir) => {
            println!("app_dir: {}", data_dir.display());
            let log_dir = data_dir.join("logs");
            fs::create_dir_all(&log_dir).map_err(|e| e.to_string())?;

            let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
            let file_path = log_dir.join(format!("messages_{}.json", timestamp));

            let json = serde_json::to_string_pretty(&messages).map_err(|e| e.to_string())?;
            fs::write(file_path, json).map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
pub async fn load_latest_log_messages(app_handle: AppHandle) -> Result<Vec<String>, String> {
    println!("load_latest_log_messages");
    match app_handle.path().data_dir() {
        Err(_) => return Err("无法获取应用数据目录".to_string()),
        Ok(app_dir) => {
            let log_dir = app_dir.join("logs");

            if !log_dir.exists() {
                return Ok(Vec::new());
            }

            let mut log_files: Vec<PathBuf> = fs::read_dir(&log_dir)
                .map_err(|e| e.to_string())?
                .filter_map(|e| e.ok())
                .map(|e| e.path())
                .filter(|p| p.is_file() && p.extension().unwrap_or_default() == "json")
                .collect();

            log_files.sort_by(|a, b| {
                b.metadata()
                    .and_then(|m| m.modified())
                    .unwrap_or(std::time::UNIX_EPOCH)
                    .cmp(
                        &a.metadata()
                            .and_then(|m| m.modified())
                            .unwrap_or(std::time::UNIX_EPOCH),
                    )
            });

            match log_files.first() {
                Some(path) => {
                    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
                    serde_json::from_str(&content).map_err(|e| e.to_string())
                }
                None => Ok(Vec::new()),
            }
        }
    }
}
