// use ffi_wrapper::MessageData;
use crate::ffi_wrapper::MessageData;
use std::sync::{Arc, RwLock};
use std::thread::sleep;
use zmq::{Context, SocketType};
pub struct ServerHandler {
    address_: String,
    handler_: Box<dyn Fn(&Self, MessageData) -> () + Send + Sync>,
    closed_: Arc<RwLock<bool>>,
}
impl ServerHandler {
    pub fn new<F>(address: &str, handler: F) -> Self
    where
        F: 'static + Fn(&Self, MessageData) -> () + Send + Sync,
    {
        Self {
            address_: address.to_string(),
            handler_: Box::new(handler),
            closed_: Arc::<RwLock<bool>>::new(true.into()),
        }
    }
    pub fn run(&self) -> () {
        *self.closed_.as_ref().write().unwrap() = false;
        // Create communication context (like TCP connection pool)
        let ctx = Context::new();
        let rep = ctx
            .socket(SocketType::REP)
            .expect("Failed to create socket");
        rep.bind(&self.address_).expect("Failed to bind socket");
        if *self.closed_.as_ref().read().unwrap() {
            return;
        }
        println!("Server listening on: {}", self.address_);
        // Send messages (0 means non-blocking mode)
        loop {
            if *self.closed_.as_ref().read().unwrap() {
                break;
            }
            match rep.recv_bytes(zmq::DONTWAIT) {
                Ok(data) => {
                    // Try to decode as binary message
                    if let Ok(decoded_msg) = MessageData::from_bytes(&data) {
                        (&self.handler_)(&self, decoded_msg);
                    }
                    // Send back the same message
                    rep.send(data, 0).expect("Failed to send message back");
                }
                Err(_) => {
                    continue;
                }
            }
            sleep(std::time::Duration::from_millis(1));
        }
    }
    pub fn close(&self) {
        *self.closed_.as_ref().write().unwrap() = true;
    }
    pub fn is_closed(&self) -> bool {
        *self.closed_.as_ref().read().unwrap()
    }
    pub fn set_handler<F>(&mut self, handler: F)
    where
        F: 'static + Fn(&Self, MessageData) -> () + Send + Sync,
    {
        self.handler_ = Box::new(handler);
    }
    pub fn address(&self) -> &str {
        &self.address_
    }
    pub fn set_address(&mut self, address: &str) {
        self.address_ = address.to_string();
    }
}
