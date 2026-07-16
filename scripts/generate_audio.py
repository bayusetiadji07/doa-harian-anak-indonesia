"""
Generate Arabic audio for all 56 doa using OpenAI TTS (via Emergent Universal Key).
Reads /app/data/doa.json, generates one MP3 per doa in /app/assets/audio/{id}.mp3.
Skips files that already exist (idempotent). Uses tts-1-hd model + `shimmer` voice
(bright, kid-friendly) for better pronunciation quality.
"""
import asyncio
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.openai import OpenAITextToSpeech

load_dotenv("/app/backend/.env")

DATA_FILE = Path("/app/data/doa.json")
OUT_DIR = Path("/app/assets/audio")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "tts-1-hd"
VOICE = "shimmer"   # bright & cheerful, works reasonably well for Arabic
SPEED = 0.9          # slightly slower for clarity in recitation


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not set")
        sys.exit(1)

    with open(DATA_FILE, encoding="utf-8") as f:
        payload = json.load(f)

    tts = OpenAITextToSpeech(api_key=api_key)
    doa_list = payload["doa"]
    total = len(doa_list)
    print(f"Generating {total} audio files -> {OUT_DIR}")

    for i, doa in enumerate(doa_list, start=1):
        out_path = OUT_DIR / f"{doa['id']}.mp3"
        if out_path.exists() and out_path.stat().st_size > 1024:
            print(f"[{i}/{total}] SKIP  #{doa['id']} {doa['nama']} (already exists)")
            continue

        text = doa["arab"]
        try:
            audio_bytes = await tts.generate_speech(
                text=text,
                model=MODEL,
                voice=VOICE,
                speed=SPEED,
                response_format="mp3",
            )
            out_path.write_bytes(audio_bytes)
            print(f"[{i}/{total}] OK    #{doa['id']} {doa['nama']} ({len(audio_bytes)} bytes)")
        except Exception as e:
            print(f"[{i}/{total}] FAIL  #{doa['id']} {doa['nama']}: {e}")

    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
