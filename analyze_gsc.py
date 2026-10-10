#!/usr/bin/env python3
"""
Analys av Google Search Console-export.

Kör på en katalog med GSC-CSV:er (svenska eller engelska filnamn):

    python3 analyze_gsc.py --dir search-console --site https://minodling.se
    python3 analyze_gsc.py --dir search-console --out seo-analys.md

Hanterar både svenska och engelska kolumnnamn, procenttecken, decimalkomma
och tusenavgränsare. Skriver en sammanfattning till stdout och kan generera
en Markdown-rapport.

Begränsningar som är värda att känna till:
  * GSC:s UI-export är kapad till 1000 rader per dimension. Har sajten fler
    frågor än så täcker frågedatan bara en delmängd av trafiken – skriptet
    räknar ut och skriver ut hur stor den delmängden är.
  * Exporten innehåller ingen koppling mellan fråga och sida. Äkta
    kannibalisering (flera sidor på samma sökord) går därför inte att mäta
    härifrån; det kräver GSC:s API eller Looker Studio. Skriptet upptäcker
    i stället dubbletter på värdnivå (www kontra apex), vilket är samma
    problem i en form som datan faktiskt visar.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import pandas as pd

# ── Filnamn: svenska och engelska varianter ──────────────────────────────

FILE_ALIASES: dict[str, list[str]] = {
    "queries":   ["Frågor", "Queries", "Fragor"],
    "pages":     ["Sidor", "Pages"],
    "countries": ["Länder", "Countries", "Lander"],
    "devices":   ["Enheter", "Devices"],
    "dates":     ["Diagram", "Dates", "Datum"],
    "appearance": ["Visningssätt i sökresultaten", "Search appearance"],
    "filters":   ["Filter", "Filters"],
}

# ── Kolumnnamn → kanoniska namn ──────────────────────────────────────────

COLUMN_ALIASES: dict[str, str] = {
    # dimensioner
    "vanligaste frågorna": "key", "vanligaste fragorna": "key",
    "top queries": "key", "fråga": "key", "query": "key",
    "populäraste sidorna": "key", "populaste sidorna": "key",
    "top pages": "key", "sida": "key", "page": "key",
    "land": "key", "country": "key",
    "enhet": "key", "device": "key",
    "datum": "date", "date": "date",
    # mätvärden
    "klick": "clicks", "clicks": "clicks",
    "exponeringar": "impressions", "impressions": "impressions",
    "ctr": "ctr",
    "position": "position",
}

# Ungefärliga CTR-benchmarks per position (andel, inte procent).
# Används bara för att peka ut avvikelser – inte som exakta mål.
CTR_BENCHMARK: dict[int, float] = {
    1: 0.275, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
    6: 0.04, 7: 0.033, 8: 0.028, 9: 0.024, 10: 0.021,
}


def benchmark_ctr(position: float) -> float:
    """Förväntad CTR för en given snittposition."""
    if pd.isna(position):
        return 0.0
    p = int(round(position))
    if p <= 0:
        return CTR_BENCHMARK[1]
    if p in CTR_BENCHMARK:
        return CTR_BENCHMARK[p]
    # Bortom topp 10 faller CTR snabbt; grov approximation.
    return max(0.001, 0.021 * (10.0 / p) ** 1.5)


# ── Inläsning och normalisering ──────────────────────────────────────────

def to_number(series: pd.Series) -> pd.Series:
    """Rensar procenttecken, decimalkomma, tusenavgränsare och blanksteg."""
    cleaned = (
        series.astype(str)
        .str.replace("%", "", regex=False)
        .str.replace(" ", "", regex=False)   # hårt blanksteg
        .str.replace(" ", "", regex=False)   # smalt blanksteg
        .str.replace(" ", "", regex=False)
        .str.replace(",", ".", regex=False)
        .str.strip()
    )
    return pd.to_numeric(cleaned, errors="coerce")


def find_file(directory: Path, kind: str) -> Path | None:
    """Hittar en CSV oavsett svenskt/engelskt namn och skiftläge."""
    for alias in FILE_ALIASES[kind]:
        exact = directory / f"{alias}.csv"
        if exact.exists():
            return exact
    wanted = {a.lower() for a in FILE_ALIASES[kind]}
    for path in directory.glob("*.csv"):
        if path.stem.lower() in wanted:
            return path
    return None


def load(directory: Path, kind: str) -> pd.DataFrame | None:
    """Läser in en CSV och normaliserar kolumnnamn och taltyper."""
    path = find_file(directory, kind)
    if path is None:
        return None

    frame = None
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            frame = pd.read_csv(path, encoding=encoding)
            break
        except (UnicodeDecodeError, UnicodeError):
            continue
    if frame is None or frame.empty:
        return None

    frame.columns = [
        COLUMN_ALIASES.get(str(c).strip().lower(), str(c).strip().lower())
        for c in frame.columns
    ]
    for col in ("clicks", "impressions", "position"):
        if col in frame.columns:
            frame[col] = to_number(frame[col])
    if "ctr" in frame.columns:
        frame["ctr"] = to_number(frame["ctr"]) / 100.0   # procent → andel
    if "date" in frame.columns:
        frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    return frame


# ── Delanalyser ──────────────────────────────────────────────────────────

def overview(dates: pd.DataFrame | None, pages: pd.DataFrame | None) -> dict:
    """Totalsiffror, datumspann och trend. Diagram.csv är mest tillförlitlig."""
    out: dict = {}
    if dates is not None and "date" in dates.columns:
        d = dates.dropna(subset=["date"]).set_index("date").sort_index()
        out["start"], out["end"] = d.index.min(), d.index.max()
        out["days"] = len(d)
        out["clicks"] = int(d["clicks"].sum())
        out["impressions"] = int(d["impressions"].sum())
        monthly = d.resample("MS").agg(
            clicks=("clicks", "sum"),
            impressions=("impressions", "sum"),
            position=("position", "mean"),
        )
        monthly["ctr"] = monthly["clicks"] / monthly["impressions"].replace(0, pd.NA)
        out["monthly"] = monthly
        weekly = d.resample("W").agg(
            clicks=("clicks", "sum"), impressions=("impressions", "sum")
        )
        out["weekly"] = weekly
        if len(d) >= 56:
            out["last28"] = d.iloc[-28:][["clicks", "impressions"]].sum()
            out["prev28"] = d.iloc[-56:-28][["clicks", "impressions"]].sum()
    elif pages is not None:
        out["clicks"] = int(pages["clicks"].sum())
        out["impressions"] = int(pages["impressions"].sum())

    if out.get("impressions"):
        out["ctr"] = out["clicks"] / out["impressions"]
    return out


def host_split(pages: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Delar upp sidor per värdnamn och hittar sökvägar som finns under flera
    värdar. Det är duplicerat innehåll som splittrar rankningssignaler.
    """
    p = pages.copy()
    p["host"] = p["key"].str.extract(r"https?://([^/]+)")
    p["path"] = p["key"].str.replace(r"https?://[^/]+", "", regex=True)
    p.loc[p["path"] == "", "path"] = "/"

    per_host = (
        p.groupby("host")
        .agg(pages=("path", "nunique"), clicks=("clicks", "sum"),
             impressions=("impressions", "sum"))
        .sort_values("impressions", ascending=False)
    )
    dupes = (
        p.groupby("path")
        .agg(hosts=("host", "nunique"), clicks=("clicks", "sum"),
             impressions=("impressions", "sum"))
        .query("hosts > 1")
        .sort_values("impressions", ascending=False)
    )
    return per_host, dupes


def striking_distance(queries: pd.DataFrame, min_impressions: int = 100,
                      lo: float = 5.0, hi: float = 20.0) -> pd.DataFrame:
    """Sökord nära topp 3: position 5–20 med tillräcklig volym."""
    q = queries.dropna(subset=["position"])
    hits = q[(q["position"] >= lo) & (q["position"] <= hi) &
             (q["impressions"] >= min_impressions)].copy()
    hits["ctr_at_pos3"] = CTR_BENCHMARK[3]
    hits["potential_clicks"] = (hits["impressions"] * hits["ctr_at_pos3"]
                                - hits["clicks"]).round(0)
    return hits.sort_values("potential_clicks", ascending=False)


def low_ctr(frame: pd.DataFrame, max_position: float = 5.0,
            min_impressions: int = 50) -> pd.DataFrame:
    """Rankar bra men får inte klicken – titel/meta är sannolikt problemet."""
    f = frame.dropna(subset=["position"]).copy()
    f = f[(f["position"] <= max_position) & (f["impressions"] >= min_impressions)]
    f["expected_ctr"] = f["position"].map(benchmark_ctr)
    f["ctr_gap"] = f["expected_ctr"] - f["ctr"]
    f["potential_clicks"] = (f["ctr_gap"] * f["impressions"]).round(0)
    return f[f["ctr_gap"] > 0].sort_values("potential_clicks", ascending=False)


def impressions_no_clicks(frame: pd.DataFrame,
                          min_impressions: int = 300) -> pd.DataFrame:
    """Mycket visning, nästan inga klick."""
    f = frame[(frame["impressions"] >= min_impressions)].copy()
    f = f[f["ctr"].fillna(0) < 0.005]
    return f.sort_values("impressions", ascending=False)


def brand_split(queries: pd.DataFrame, patterns: list[str]) -> dict:
    """Hur beroende är trafiken av varumärkessökningar?"""
    rx = re.compile("|".join(patterns), re.IGNORECASE)
    is_brand = queries["key"].astype(str).str.contains(rx, na=False)
    branded, generic = queries[is_brand], queries[~is_brand]
    return {
        "branded_queries": len(branded),
        "generic_queries": len(generic),
        "branded_clicks": int(branded["clicks"].sum()),
        "generic_clicks": int(generic["clicks"].sum()),
        "branded_impressions": int(branded["impressions"].sum()),
        "generic_impressions": int(generic["impressions"].sum()),
        "top_branded": branded.nlargest(10, "clicks"),
    }


def content_gaps(queries: pd.DataFrame, min_impressions: int = 200,
                 min_position: float = 20.0) -> pd.DataFrame:
    """
    Hög volym men dålig position. Ofta tecken på att ingen sida är dedikerad
    åt ämnet – Google matchar något närliggande i stället.
    """
    q = queries.dropna(subset=["position"])
    gaps = q[(q["impressions"] >= min_impressions) &
             (q["position"] >= min_position)].copy()
    return gaps.sort_values("impressions", ascending=False)


# ── Rapport ──────────────────────────────────────────────────────────────

def pct(x: float | None) -> str:
    return "–" if x is None or pd.isna(x) else f"{x * 100:.2f}%"


def build_report(data: dict, site: str, coverage: dict) -> str:
    o = data["overview"]
    L: list[str] = []
    add = L.append

    add(f"# SEO-analys – {site}\n")
    if o.get("start") is not None:
        add(f"Period: **{o['start']:%Y-%m-%d} – {o['end']:%Y-%m-%d}** "
            f"({o['days']} dagar)\n")

    add("## Sammanfattning\n")
    add("| Mätvärde | Värde |")
    add("|---|---|")
    add(f"| Klick | {o.get('clicks', 0):,} |".replace(",", " "))
    add(f"| Exponeringar | {o.get('impressions', 0):,} |".replace(",", " "))
    add(f"| Snitt-CTR | {pct(o.get('ctr'))} |")
    if "last28" in o:
        l, p = o["last28"], o["prev28"]
        delta = (l["clicks"] - p["clicks"]) / p["clicks"] * 100 if p["clicks"] else 0
        add(f"| Klick senaste 28 dagarna | {int(l['clicks'])} "
            f"({delta:+.0f}% mot föregående period) |")
    add("")

    if "monthly" in o:
        add("### Per månad\n")
        add("| Månad | Klick | Exponeringar | CTR | Snittposition |")
        add("|---|---|---|---|---|")
        for idx, r in o["monthly"].iterrows():
            add(f"| {idx:%Y-%m} | {int(r['clicks'])} | {int(r['impressions'])} | "
                f"{pct(r['ctr'])} | {r['position']:.1f} |")
        add("")

    for label, key in (("Enheter", "devices"), ("Länder", "countries")):
        frame = data.get(key)
        if frame is None:
            continue
        add(f"### {label}\n")
        add("| | Klick | Exponeringar | CTR | Position |")
        add("|---|---|---|---|---|")
        for _, r in frame.head(8).iterrows():
            add(f"| {r['key']} | {int(r['clicks'])} | {int(r['impressions'])} | "
                f"{pct(r['ctr'])} | {r['position']:.1f} |")
        add("")

    if data.get("dupes") is not None and len(data["dupes"]):
        d, per_host = data["dupes"], data["per_host"]
        add("## Dubblerade värdnamn\n")
        add(f"{len(d)} sökvägar är indexerade under fler än ett värdnamn, "
            f"vilket motsvarar **{int(d['impressions'].sum()):,} exponeringar**."
            .replace(",", " ") + "\n")
        add("| Värd | Sidor | Klick | Exponeringar |")
        add("|---|---|---|---|")
        for h, r in per_host.iterrows():
            add(f"| {h} | {int(r['pages'])} | {int(r['clicks'])} | "
                f"{int(r['impressions'])} |")
        add("")

    sections = [
        ("Striking distance – position 5–20", "striking", "key",
         "Flyttas dessa till topp 3 är den teoretiska vinsten:"),
        ("Låg CTR trots bra position", "low_ctr_pages", "key",
         "Rankar högt men får inte klicken. Åtgärd: ny title och meta description."),
        ("Många exponeringar, nästan inga klick", "no_clicks", "key",
         "Google visar sidan men ingen klickar."),
        ("Möjliga innehållsluckor", "gaps", "key",
         "Hög volym men position 20+. Ofta saknas en dedikerad sida."),
    ]
    for title, key, label_col, blurb in sections:
        frame = data.get(key)
        if frame is None or not len(frame):
            continue
        add(f"## {title}\n")
        add(blurb + "\n")
        add("| Sökord/sida | Klick | Exponeringar | CTR | Position | Potential |")
        add("|---|---|---|---|---|---|")
        for _, r in frame.head(15).iterrows():
            pot = r.get("potential_clicks", float("nan"))
            pot_s = "–" if pd.isna(pot) else f"+{int(pot)}"
            add(f"| {str(r[label_col])[:60]} | {int(r['clicks'])} | "
                f"{int(r['impressions'])} | {pct(r['ctr'])} | "
                f"{r['position']:.1f} | {pot_s} |")
        add("")

    if data.get("brand"):
        b = data["brand"]
        total = b["branded_clicks"] + b["generic_clicks"]
        share = b["branded_clicks"] / total * 100 if total else 0
        add("## Varumärkt kontra generisk trafik\n")
        add(f"- Varumärkta sökord: **{b['branded_clicks']} klick** "
            f"({share:.0f}% av klicken i frågedatan)")
        add(f"- Generiska sökord: **{b['generic_clicks']} klick**\n")

    add("## Datatäckning\n")
    add(f"- Frågedatan täcker **{coverage['click_cov']:.0f}% av klicken** och "
        f"**{coverage['imp_cov']:.0f}% av exponeringarna**.")
    if coverage["capped"]:
        add("- Exporten är kapad till 1000 rader. Fler sökord finns – hämta via "
            "GSC:s API eller Looker Studio för fullständig bild.")
    add("- Exporten saknar koppling mellan sökord och sida, så kannibalisering "
        "på sökordsnivå går inte att mäta härifrån.\n")
    return "\n".join(L)


# ── Körning ──────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="Analysera en GSC-export.")
    ap.add_argument("--dir", default="search-console", help="Katalog med CSV-filer")
    ap.add_argument("--site", default="", help="Sajtens URL, används i rubriken")
    ap.add_argument("--out", default="", help="Skriv Markdown-rapport hit")
    ap.add_argument("--brand", default="", help="Kommaseparerade varumärkesord")
    args = ap.parse_args()

    directory = Path(args.dir)
    if not directory.is_dir():
        print(f"Katalogen finns inte: {directory}", file=sys.stderr)
        return 1

    queries = load(directory, "queries")
    pages = load(directory, "pages")
    dates = load(directory, "dates")
    devices = load(directory, "devices")
    countries = load(directory, "countries")

    if queries is None and pages is None:
        print("Hittade varken fråge- eller sidexport.", file=sys.stderr)
        return 1

    site = args.site or "sajten"
    brand_terms = ([t.strip() for t in args.brand.split(",") if t.strip()]
                   or [re.sub(r"^https?://(www\.)?|\.\w+$", "", site) or "brand"])

    data: dict = {
        "overview": overview(dates, pages),
        "devices": devices,
        "countries": countries,
    }

    if pages is not None:
        per_host, dupes = host_split(pages)
        data["per_host"], data["dupes"] = per_host, dupes
        data["low_ctr_pages"] = low_ctr(pages)
        data["no_clicks"] = impressions_no_clicks(pages)

    if queries is not None:
        data["striking"] = striking_distance(queries)
        data["gaps"] = content_gaps(queries)
        data["brand"] = brand_split(queries, brand_terms)

    total_clicks = data["overview"].get("clicks", 0) or 0
    total_imps = data["overview"].get("impressions", 0) or 0
    coverage = {
        "click_cov": (queries["clicks"].sum() / total_clicks * 100
                      if queries is not None and total_clicks else 0),
        "imp_cov": (queries["impressions"].sum() / total_imps * 100
                    if queries is not None and total_imps else 0),
        "capped": queries is not None and len(queries) >= 1000,
    }

    # Konsolsammanfattning
    o = data["overview"]
    print(f"Period      : {o.get('start', '?')} – {o.get('end', '?')}")
    print(f"Klick       : {o.get('clicks', 0)}")
    print(f"Exponeringar: {o.get('impressions', 0)}")
    print(f"CTR         : {pct(o.get('ctr'))}")
    if data.get("dupes") is not None:
        print(f"Dubbletter  : {len(data['dupes'])} sökvägar på flera värdnamn")
    for key, label in (("striking", "Striking distance"),
                       ("low_ctr_pages", "Låg CTR"),
                       ("no_clicks", "Expo utan klick"),
                       ("gaps", "Innehållsluckor")):
        if data.get(key) is not None:
            print(f"{label:<12}: {len(data[key])} träffar")

    if args.out:
        report = build_report(data, site, coverage)
        Path(args.out).write_text(report, encoding="utf-8")
        print(f"\nRapport skriven: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
