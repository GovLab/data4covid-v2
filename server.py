#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.parse

PORT = 8000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        print(f"Request: {self.command} {path}")
        
        # Handle project routes - serve projects/index.html for any /projects/ URL
        if path.startswith('/projects/') and path != '/projects/':
            path = '/projects/index.html'
        
        # Default to index.html for root
        if path == '/':
            path = '/index.html'
        
        # Update the path
        self.path = path
        
        # Call the parent class method
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Change to the directory containing the files
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Create the server
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    print("Project pages will be served from projects/index.html")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.") 