import requests
from typing import List, Dict

def fetch_users() -> List[Dict]:
    url = "https://jsonplaceholder.typicode.com/users"
    res = requests.get(url)
    res.raise_for_status()
    return res.json()