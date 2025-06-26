import http.server
import os

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Serve files from the www directory
        root = os.path.join(os.path.dirname(__file__), 'www')
        # Remove query string and fragment
        path = path.split('?', 1)[0].split('#', 1)[0]
        if path == '/':
            path = '/index.html'
        return os.path.join(root, path.lstrip('/'))

def run(server_class=http.server.HTTPServer, handler_class=CustomHTTPRequestHandler):
    server_address = ('', 3000)
    httpd = server_class(server_address, handler_class)
    print('Serving HTTP on port 3000...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run()
