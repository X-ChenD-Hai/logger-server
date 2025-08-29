pub mod server;
pub mod store;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use server::*;
use store::*;
use tauri_plugin_store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            start_zmq_server,
            stop_zmq_server,
            get_server_status,
            get_received_json,
            save_settings,
            load_settings,
            save_log_messages,
            load_latest_log_messages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
