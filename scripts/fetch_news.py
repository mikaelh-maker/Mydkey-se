#!/usr/bin/env python3
"""Hämtar rubriker om cybersäkerhet och IT-innovation till news.json.

Endast oberoende redaktioner och myndigheter, inga leverantörsbloggar.
Sparar bara rubrik, länk, källa och datum (inga utdrag ur artiklarna).
Körs av .github/workflows/news.yml.
"""
import json, re, sys, html, urllib.request
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET

SOURCES = [
    # namn, url, språk, ämne
    ("CERT-SE", "https://www.cert.se/feed.rss", "sv", "sec"),
    ("Computer Sweden", "https://computersweden.se/feed/", "sv", "it"),
    ("BleepingComputer", "https://www.bleepingcomputer.com/feed/", "en", "sec"),
    ("The Record", "https://therecord.media/feed", "en", "sec"),
    ("Krebs on Security", "https://krebsonsecurity.com/feed/", "en", "sec"),
    ("Ars Technica", "https://arstechnica.com/security/feed/", "en", "sec"),
    ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/technology-lab", "en", "it"),
    ("MIT Technology Review", "https://www.technologyreview.com/feed/", "en", "it"),
    ("NCSC UK", "https://www.ncsc.gov.uk/api/1/services/v1/news-rss-feed.xml", "en", "sec"),
]

# Bort med reklam, evenemang, affärs- och branschnyheter
BLOCK = re.compile(r"sponsor|partner content|partnerinnehåll|annons|webinar|webbinar|"
                   r"podcast|podd|deal|discount|rabatt|% off|black friday|giveaway|"
                   r"funding|raises \$|acquires|acquisition|förvärv|köper upp|"
                   r"industry moves|hiring|job(b)? |rekryter|award|event|konferens|"
                   r"veckobrev|newsletter|nyhetsbrev|the download", re.I)
BLOCK_CAT = re.compile(r"careers|sponsored|deals|events", re.I)

MAX_AGE = timedelta(days=10)
PER_SOURCE = 4
TOTAL = 24
UA = "Mozilla/5.0 (compatible; mydkey-news/1.0; +https://mydkey.se/)"


def text(el, *tags):
    for t in tags:
        v = el.findtext(t)
        if v:
            return html.unescape(re.sub(r"\s+", " ", v)).strip()
    return ""


def when(s):
    if not s:
        return None
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception:
            return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def fetch(name, url, lang, topic):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        root = ET.fromstring(r.read())
    atom = "{http://www.w3.org/2005/Atom}"
    out = []
    items = root.iter("item")
    for it in items:
        cats = " ".join(c.text or "" for c in it.findall("category"))
        out.append((text(it, "title"), text(it, "link"), when(text(it, "pubDate")), cats))
    for it in root.iter(atom + "entry"):
        link = it.find(atom + "link")
        out.append((text(it, atom + "title"), link.get("href") if link is not None else "",
                    when(text(it, atom + "updated", atom + "published")), ""))
    now = datetime.now(timezone.utc)
    res = []
    for title, link, d, cats in out:
        if not title or not link.startswith("https://") or not d:
            continue
        if now - d > MAX_AGE or BLOCK.search(title) or BLOCK_CAT.search(cats):
            continue
        res.append({"title": title[:180], "url": link, "source": name, "lang": lang,
                    "topic": topic, "date": d.astimezone(timezone.utc).isoformat(timespec="minutes")})
    res.sort(key=lambda x: x["date"], reverse=True)
    return res[:PER_SOURCE]


def main(path):
    items, seen, errors = [], set(), []
    for src in SOURCES:
        try:
            for it in fetch(*src):
                key = re.sub(r"\W+", "", it["title"].lower())[:60]
                if key not in seen and it["url"] not in seen:
                    seen.update((key, it["url"]))
                    items.append(it)
        except Exception as e:  # en trasig källa ska inte stoppa resten
            errors.append(f"{src[0]}: {e}")
    items.sort(key=lambda x: x["date"], reverse=True)
    items = items[:TOTAL]
    for e in errors:
        print("VARNING", e, file=sys.stderr)
    if len(items) < 6:
        print("För få nyheter, behåller gamla news.json", file=sys.stderr)
        return
    data = {"updated": datetime.now(timezone.utc).isoformat(timespec="minutes"), "items": items}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(items)} nyheter sparade")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "news.json")
