#!/usr/bin/env python3
import socket
import json
import hashlib

def test_tcp_server():
    """Test the TCP server by sending JSON and receiving MD5 hash"""
    host = 'localhost'
    port = 5555
    
    # Test data
    test_data = [
        '{"message": "Hello, World!", "timestamp": 1234567890}',
        '{"user": "test", "action": "login", "success": true}',
        '{"data": [1, 2, 3, 4, 5], "metadata": {"count": 5}}'
    ]
    
    for i, json_data in enumerate(test_data):
        try:
            # Create socket and connect
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.connect((host, port))
                
                # Send JSON data
                s.sendall(json_data.encode('utf-8'))
                
                # Receive response
                response = s.recv(1024).decode('utf-8').strip()
                
                # Compute expected MD5
                expected_md5 = hashlib.md5(json_data.encode('utf-8')).hexdigest()
                
                # Parse response
                response_data = json.loads(response)
                received_md5 = response_data.get('hash', '')
                
                # Verify
                if received_md5 == expected_md5:
                    print(f"✓ Test {i+1} PASSED: MD5 hash matches")
                    print(f"  Sent: {json_data}")
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
    print("Testing TCP Server...")
    print("Make sure the Tauri application is running with TCP server started on port 5555")
    print("=" * 60)
    test_tcp_server()
