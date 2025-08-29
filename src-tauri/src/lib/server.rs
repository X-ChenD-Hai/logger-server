use msg_server::zmq_support;
use once_cell::sync::Lazy;
use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use tauri::Emitter;

static RECEIVED_MESSAGES: Lazy<Arc<Mutex<Vec<String>>>> =
    Lazy::new(|| Arc::new(Mutex::new(Vec::new())));

static mut SERVER: Option<zmq_support::ServerHandler> = None;
static mut MESSAGE_CHANNEL: Option<mpsc::Sender<String>> = None;

#[tauri::command]
pub async fn start_zmq_server(app_handle: tauri::AppHandle, addr: &str) -> Result<String, String> {
    println!("Starting ZMQ server on {}", addr);
    unsafe {
        // Create a channel for message passing
        let (tx, rx) = mpsc::channel();
        MESSAGE_CHANNEL = Some(tx);

        SERVER = Some(zmq_support::ServerHandler::new(addr, move |_, msg| {
            // Store the message in the global vector
            if let Ok(json_str) = msg.to_json_string() {
                RECEIVED_MESSAGES.lock().unwrap().push(json_str.clone());

                // Send message through channel
                let tx_ptr = &raw const MESSAGE_CHANNEL;
                if let Some(tx) = &*tx_ptr {
                    let _ = tx.send(json_str);
                }
            }
        }));

        // Start message handler thread
        thread::spawn(move || {
            while let Ok(json_str) = rx.recv() {
                println!("Received message: {}", json_str);
                let _ = app_handle.emit("message-received", json_str);
            }
        });

        // Start server in current thread (blocking)
        let server_ptr = &raw const SERVER;
        let server = (&*server_ptr).as_ref().unwrap();
        thread::spawn(move || {
            server.run();
        });
    }

    Ok(format!("ZMQ server started on {}", addr))
}

#[tauri::command]
pub async fn stop_zmq_server() -> Result<String, String> {
    unsafe {
        let server_ptr = &raw const SERVER;
        if let Some(server) = &*server_ptr {
            if !server.is_closed() {
                server.close();
                Ok("ZMQ server stopped".to_string())
            } else {
                Err("ZMQ server is not running".to_string())
            }
        } else {
            Err("ZMQ server is not running".to_string())
        }
    }
}

#[tauri::command]
pub async fn get_server_status() -> Result<bool, String> {
    unsafe {
        let server_ptr = &raw const SERVER;
        if let Some(server) = &*server_ptr {
            Ok(!server.is_closed())
        } else {
            Ok(false)
        }
    }
}

#[tauri::command]
pub async fn get_received_json() -> Result<Vec<String>, String> {
    let messages = RECEIVED_MESSAGES.lock().unwrap();
    Ok(messages.clone())
}
