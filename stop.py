import requests

try:
    requests.get("http://localhost:3000/exit/")
except:
    print("Express app stopped.")