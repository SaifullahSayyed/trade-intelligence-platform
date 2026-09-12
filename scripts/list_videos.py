import urllib.request, urllib.parse, json

url = "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Videos_of_container_ships&cmtype=file&format=json"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req) as resp:
        d = json.loads(resp.read().decode("utf-8"))
        for m in d.get("query", {}).get("categorymembers", []):
            title = m.get("title")
            p_url = "https://commons.wikimedia.org/w/api.php?action=query&titles=" + urllib.parse.quote(title) + "&prop=imageinfo&iiprop=size|url&format=json"
            r2 = urllib.request.Request(p_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(r2) as resp2:
                d2 = json.loads(resp2.read().decode("utf-8"))
                for p in d2.get("query", {}).get("pages", {}).values():
                    ii = p.get("imageinfo", [{}])[0]
                    size_mb = ii.get("size", 0) / (1024 * 1024)
                    clean_title = title.encode("ascii", "ignore").decode("ascii")
                    url_val = ii.get("url")
                    print(str(round(size_mb, 1)) + " MB: " + clean_title + " -> " + str(url_val))
except Exception as e:
    print(e)
