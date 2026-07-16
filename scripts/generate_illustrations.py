"""
Batch generate 56 doa illustrations via Gemini Nano Banana.
Saves as .webp (compressed) at /app/assets/doa/{id}.webp
"""
import asyncio
import os
import base64
import json
import io
import time
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv('/app/backend/.env')
API_KEY = os.getenv("EMERGENT_LLM_KEY")
MODEL = "gemini-3.1-flash-image-preview"
OUT_DIR = Path("/app/assets/doa")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Consistent art style across all illustrations
STYLE = (
    "cute 3D cartoon illustration in the style of Pixar meets Studio Ghibli, "
    "warm soft colors, kid-friendly, wholesome Islamic setting, square composition, "
    "clean vector-like edges, soft ambient lighting, subtle depth, "
    "no text no letters no calligraphy, centered subject, cozy atmosphere"
)

BOY = "an Indonesian muslim boy about 6 years old wearing a small white kopiah cap and light blue traditional shirt, chubby cheeks, warm smile"
GIRL = "an Indonesian muslim girl about 6 years old wearing a soft pink hijab and cheerful smile, chubby cheeks"

# Per-doa prompt: context for the scene
DOA_PROMPTS = {
    1: f"{BOY} lying peacefully on a cozy bed in a bedroom at night, moon and stars visible through a window, hands folded near chest, closed eyes, cozy warm blanket, soft moonlight",
    2: f"{BOY} sitting on the edge of his bed in the morning, stretching arms with a big cheerful yawn, morning sunlight streaming through window, birds visible outside",
    3: f"{GIRL} sitting at a small wooden dining table with a plate of colorful healthy Indonesian food (nasi tumpeng shape), hands raised in prayer position before eating, home kitchen background",
    4: f"{BOY} sitting at a dining table with an empty happy plate, patting his tummy contentedly with a big smile, hands folded in gratitude, cozy dining room",
    5: f"{GIRL} holding a glass of clear water with both hands, about to drink, sitting at a wooden table, sunny warm interior",
    6: f"{BOY} holding an empty glass with a satisfied refreshed smile, water droplet still visible, kitchen background with fruits on counter",
    7: f"{BOY} standing outside a bathroom door in a cozy home hallway, one hand on the doorknob, looking slightly cautious, warm interior lights",
    8: f"{GIRL} walking out of a bathroom with a happy smile, clean and refreshed, holding a small towel, home hallway with soft lighting",
    9: f"{BOY} standing near a wudhu ablution water tap, sleeves rolled up, hands ready near a basin of clear water, mosque courtyard style background",
    10: f"{GIRL} with fresh clean face and hands after wudhu, water droplets sparkling, standing near an ablution area, peaceful mosque backdrop",
    11: f"{BOY} holding up a colorful clean baju koko islamic shirt, cheerful expression, cozy bedroom background with wardrobe",
    12: f"{GIRL} carefully folding clothes and placing them into a woven basket, cozy bedroom setting, warm lighting",
    13: f"{GIRL} standing in front of a round vintage mirror, adjusting her pink hijab with a smile, morning light, dresser with small vase",
    14: f"{BOY} at the front door of a cozy Indonesian home, waving goodbye to his mother, wearing school bag, morning sunny street outside",
    15: f"{GIRL} walking through the front door of her home with a happy smile, warm home interior visible, evening golden light",
    16: f"{GIRL} sitting at a study desk with open colorful books, pencil in hand, hands raised briefly in prayer, cozy study room with plants and lamp",
    17: f"{BOY} closing a book with a satisfied smile, backpack ready, study desk with pencils and notebooks, warm afternoon light",
    18: f"{BOY} walking out of a colorful classroom door with a friend, backpack on, cheerful school hallway",
    19: f"{GIRL} sitting inside a car buckling seatbelt, hands briefly in prayer, sunny road visible through window, family car interior",
    20: f"{BOY} standing next to a colorful travel suitcase, wearing small backpack, at a train station or airport waiting area, cheerful",
    21: f"{BOY} stepping into a beautiful Indonesian mosque with green dome, right foot forward, mosque entrance with arch, warm evening light",
    22: f"{BOY} walking out of a mosque with peaceful expression, mosque doorway visible behind, dusk sky",
    23: f"{GIRL} pausing to listen with hand cupped near ear, mosque minaret visible in the background, sunset sky, expression of attention",
    24: f"{BOY} with hands cupped in prayer facing a mosque with minaret, golden hour lighting, peaceful expression",
    25: f"{GIRL} sitting on a prayer mat holding an open Al-Quran mushaf gently with both hands, warm room lighting, before reading, respectful pose",
    26: f"{BOY} gently closing an Al-Quran mushaf, hand on the cover, peaceful satisfied smile, cozy quran study nook",
    27: f"{GIRL} peeking out of a window watching rain fall on a garden outside, hand near glass, cozy indoor with warm lamp, cheerful",
    28: f"{BOY} looking out a window at a dramatic sky with lightning bolt in distance, wide curious eyes but calm expression, cozy safe indoor room",
    29: f"{GIRL} pointing joyfully at a beautiful rainbow arching across a bright sky above rice fields, mountains in background, big smile",
    30: f"{BOY} lying on a cozy bed with a small compress on forehead, sad but hopeful expression, a hand-drawn get-well card visible, warm bedside lamp",
    31: f"{BOY} covering his mouth with tissue mid-sneeze, comedic expression, cozy home interior",
    32: f"{GIRL} pointing to a friend who just sneezed with a kind concerned face, both wearing casual clothes, home living room",
    33: f"{GIRL} holding a small woven basket walking through a colorful Indonesian traditional market entrance, stalls of fruits and spices visible",
    34: f"{BOY} walking out of a market entrance with a basket of groceries, satisfied smile, market colorful stalls behind",
    35: f"{GIRL} sitting next to a sick friend in a warm room, offering a bowl of soup and flowers with a caring smile",
    36: f"{BOY} sitting cross-legged with an open book and hands slightly raised, thoughtful expression, glowing light bulb icon floating above suggesting knowledge, study room",
    37: f"{GIRL} standing at the base of a small hill or staircase looking up with determined smile, path ahead lit warmly",
    38: f"{BOY} standing calm with a subtle glowing dome of protection light around him, night background with stars, peaceful expression",
    39: f"{BOY} kneeling with hands raised in dua, tears of hope in eyes, warm golden light from above, prayer mat",
    40: f"{GIRL} hugging her parents (Indonesian dad in batik shirt and mom in hijab) with big smile, warm family living room",
    41: f"{BOY} handing a small flower or apple to a teacher (woman in hijab) in a classroom setting, cheerful and respectful",
    42: f"{GIRL} between her parents on one side and teacher on the other, all smiling, hands raised in prayer, warm sunny outdoor school garden",
    43: f"{BOY} looking at a golden coin or wallet with grateful expression, hands slightly raised in prayer, cozy home background",
    44: f"{BOY} sitting cross-legged taking a deep calming breath, small anger cloud dissipating above his head, peaceful bedroom",
    45: f"{GIRL} in a dim room holding a small lantern with brave determined smile, subtle shadows around, cozy warm light on her face",
    46: f"{GIRL} sitting by a window in soft afternoon light, single tear on cheek but hopeful gentle smile, cozy blanket around shoulders",
    47: f"{BOY} at a desk with open book, glowing star or lightbulb above his head, focused expression, warm study room",
    48: f"{GIRL} sitting under a large peaceful tree in a serene garden, hands folded gently, floating soft petals, tranquil expression",
    49: f"{BOY} standing on a wooden porch at sunrise, birds chirping, misty morning garden, hands slightly raised, peaceful dawn atmosphere",
    50: f"{GIRL} standing at a window during sunset, warm orange sky, hands folded, peaceful expression, cozy home",
    51: f"An open beautifully decorated Al-Quran mushaf with the opening surah page visible (no readable text, just decorative islamic geometric patterns), on a wooden reading rest, warm ambient light, prayer beads nearby, peaceful",
    52: f"A serene mosque interior at night with a single beam of soft golden light from above illuminating a prayer mat, protective peaceful atmosphere, geometric islamic patterns",
    53: f"A stylized heart shape glowing with warm golden light against a soft night sky with stars, symbol of sincere devotion, peaceful",
    54: f"A gentle protective dome of soft light over a small home at dawn, misty sunrise, birds silhouettes, peaceful",
    55: f"A gentle protective dome of soft light over a bustling small neighborhood in the evening, warm lantern lights in houses, peaceful",
    56: f"{BOY} and {GIRL} sitting at a small round table with an open book between them, both smiling, warm study nook, before closing a gathering",
}


async def generate_one(doa_id: int, doa_name: str, prompt_context: str, retries: int = 2):
    """Generate a single doa illustration."""
    out_path = OUT_DIR / f"{doa_id}.webp"
    if out_path.exists() and out_path.stat().st_size > 5000:
        print(f"  ⏭  #{doa_id} exists, skip")
        return True

    full_prompt = f"{prompt_context}. {STYLE}"
    for attempt in range(retries + 1):
        try:
            chat = LlmChat(
                api_key=API_KEY,
                session_id=f"doa-illust-{doa_id}",
                system_message="You are an expert illustrator creating consistent kid-friendly Islamic educational imagery."
            )
            chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
            msg = UserMessage(text=full_prompt)
            _, images = await chat.send_message_multimodal_response(msg)

            if not images:
                print(f"  ✗ #{doa_id} no image (attempt {attempt+1})")
                if attempt < retries:
                    await asyncio.sleep(2)
                    continue
                return False

            img_bytes = base64.b64decode(images[0]['data'])
            # Save as webp
            pil = Image.open(io.BytesIO(img_bytes))
            if pil.mode != 'RGB':
                pil = pil.convert('RGB')
            # Resize to 640x640 max for consistency and size
            if max(pil.size) > 640:
                pil.thumbnail((640, 640), Image.LANCZOS)
            pil.save(out_path, 'webp', quality=85, method=6)
            size_kb = out_path.stat().st_size // 1024
            print(f"  ✓ #{doa_id:>2} {doa_name[:35]:<35} → {size_kb}KB")
            return True
        except Exception as e:
            err = str(e)[:200]
            print(f"  ✗ #{doa_id} error attempt {attempt+1}: {err}")
            if attempt < retries:
                await asyncio.sleep(3)
            else:
                return False


async def main():
    with open('/app/data/doa.json') as f:
        doa_data = json.load(f)

    doas = doa_data['doa']
    print(f"Generating {len(doas)} illustrations...\n")

    # Sequential to avoid rate limits
    success = 0
    for doa in doas:
        did = doa['id']
        prompt = DOA_PROMPTS.get(did)
        if not prompt:
            print(f"  ⚠ #{did} no prompt defined, skip")
            continue
        ok = await generate_one(did, doa['nama'], prompt)
        if ok:
            success += 1
        # Small pause between requests
        await asyncio.sleep(0.5)

    print(f"\n✅ Done: {success}/{len(doas)} generated")


if __name__ == "__main__":
    asyncio.run(main())
