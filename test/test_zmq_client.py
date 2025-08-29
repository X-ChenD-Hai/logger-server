#!/usr/bin/env python3
import zmq
import json
import hashlib

def test_zmq_server():
    """Test the ZMQ server by sending JSON and receiving MD5 hash"""
    context = zmq.Context()
    
    # Connect to the ZMQ REP server
    socket = context.socket(zmq.REQ)
    socket.connect("tcp://localhost:5555")
    
    # Test data
    test_data = [
        '{"message": "Hello, World!", "timestamp": 1234567890}',
        '{"user": "test", "action": "login", "success": true}',
        '{"data": [1, 2, 3, 4, 5], "metadata": {"count": 5}}'
    ]
    
    for i, json_data in enumerate(test_data):
        try:
            # Send JSON data
            socket.send_string(json_data)
            print(f"Sent: {json_data}")
            
            # Receive response
            response = socket.recv_string()
            
            # Compute expected MD5
            expected_md5 = hashlib.md5(json_data.encode('utf-8')).hexdigest()
            
            # Parse response
            response_data = json.loads(response)
            received_md5 = response_data.get('hash', '')
            
            # Verify
            if received_md5 == expected_md5:
                print(f"✓ Test {i+1} PASSED: MD5 hash matches")
                print(f"  Received hash: {received_md5}")
            else:
                print(f"✗ Test {i+1} FAILED: MD5 hash mismatch")
                print(f"  Expected: {expected_md5}")
                print(f"  Received: {received_md5}")
            
            print()
            
        except Exception as e:
            print(f"✗ Test {i+1} ERROR: {e}")
            print()

if __name__ == "__main__":
    print("Testing ZMQ Server...")
    print("Make sure the Tauri application is running with ZMQ server started on port 5555")
    print("=" * 60)
    test_zmq_server()
