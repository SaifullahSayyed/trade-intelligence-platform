import urllib.request
import urllib.parse
import re
import json

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# Search Internet Archive for container ship / cargo ship mp4 videos
search_query = "container ship"
archive_api = f"https://archive.org/advancedsearch.php?q={urllib.parse.quote(search_query)}+AND+mediatype:movies&fl[]=identifier,title,downloads&sort[]=downloads+desc&rows=10&output=json"

try:
    req = urllib.request.Request(archive_api, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        docs = data.get("response", {}).get("docs", [])
        for doc in docs:
            ident = doc.get("identifier")
            print("Found item:", ident, doc.get("title"))
            # Fetch files for this item
            files_url = f"https://archive.org/metadata/{ident}/files"
            req2 = urllib.request.Request(files_url, headers=headers)
            with urllib.request.urlopen(req2) as resp2:
                fdata = json.loads(resp2.read().decode("utf-8"))
                for f in fdata.get("result", []):
                    name = f.get("name", "")
                    if name.endswith(".mp4") and ("512kb" in name or "720p" in name or "prores" not in name.lower()):
                        size = int(f.get("size", 0))
                        if 1_000_000 < size < 30_000_000: # between 1MB and 30MB
                            direct_url = f"https://archive.org/download/{ident}/{name}"
                            print(f"MATCH: {direct_url} (Size: {size/1024/1024:.1f} MB)")
except Exception as e:
    print("Error:", e)
