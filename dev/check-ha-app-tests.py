"""Exercise the standalone local card without core bundle, HA or npm."""
import argparse
import functools
import http.server
from pathlib import Path
import subprocess
import threading

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--browser', required=True)
a=p.parse_args()
root=Path(__file__).resolve().parent.parent
with http.server.ThreadingHTTPServer(('127.0.0.1',0), functools.partial(Quiet,directory=str(root))) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        result=subprocess.run([a.browser,'--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
            '--virtual-time-budget=4000','--dump-dom',f'http://127.0.0.1:{server.server_port}/dev/local/ha-app-card.html'],
            text=True,capture_output=True,timeout=30,check=True)
        if 'data-result="passed"' not in result.stdout:
            raise SystemExit('Companion card checks failed: '+result.stdout)
        print('6 companion card checks passed; no core bundle or service calls')
    finally: server.shutdown()
