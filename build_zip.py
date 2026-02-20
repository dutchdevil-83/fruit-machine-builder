import os
import zipfile
from PIL import Image

def build_package():
    print("Start verpakken...")
    os.makedirs("public/images", exist_ok=True)
    
    # 1. Slice de 3x3 sprite sheet dynamically
    try:
        import numpy as np
        img = Image.open("public/sprites.png").convert("RGBA")
        
        # Calculate bounding boxes using numpy
        arr = np.array(img.convert('RGB')).astype(np.int32)
        bg = np.array([254, 254, 254])
        diff = np.sum(np.abs(arr - bg), axis=2)
        mask = diff > 30
        
        proj_y = np.sum(mask, axis=1) > 0
        proj_x = np.sum(mask, axis=0) > 0
        
        def get_segments(proj, min_length=10):
            segments = []
            is_in_segment = False
            start = 0
            for i, val in enumerate(proj):
                if val and not is_in_segment:
                    is_in_segment = True
                    start = i
                elif not val and is_in_segment:
                    is_in_segment = False
                    if i - start >= min_length:
                        segments.append((start, i))
            if is_in_segment and len(proj) - start >= min_length:
                segments.append((start, len(proj)))
            return segments

        rows = get_segments(proj_y)
        cols = get_segments(proj_x)
        
        names = ['seven', 'star', 'bell', 'plum', 'orange', 'pear', 'strawberry', 'grapes', 'watermelon']
        
        idx = 0
        for y1, y2 in rows[:3]:
            for x1, x2 in cols[:3]:
                # Find center and create a 500x500 box for uniform aspect ratio and padding
                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2
                size = 250
                box = (cx - size, cy - size, cx + size, cy + size)
                
                sprite = img.crop(box)
                sprite.save(f"public/images/{names[idx]}.png")
                idx += 1
                
        print("Sprites succesvol gesneden mbv dynamic bounding boxes.")
    except Exception as e:
        print(f"Fout bij snijden sprites: {e}. Heb je 'sprites.png' in de map staan?")
        return

    # 2. Kopieer achtergrond en UI
    if os.path.exists("public/bg.png"):
        Image.open("public/bg.png").save("public/images/bg.png")
    if os.path.exists("public/ui.png"):
        Image.open("public/ui.png").save("public/images/ui.png")

    # 3. Compile React App via Vite
    import subprocess
    print("Compiling React application (Vite)...")
    try:
        subprocess.run(["npm", "run", "build"], shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Build mislukt: {e}")
        return

    # 4. Maak ZIP bestand van de dist/ map
    print("Packaging dist/ map in ZIP...")
    zip_name = "FruitMachineBuilder_Standalone.zip"
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        if os.path.exists("dist"):
            for root, _, files in os.walk("dist"):
                for f in files:
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, "dist")
                    zf.write(file_path, arcname)
        else:
            print("Fout: 'dist' map bestaat niet. Is de build gelukt?")
                
    print(f"Klaar! '{zip_name}' is aangemaakt met de volledige web app.")

    # 5. Optioneel: Electron Desktop EXE bouwen
    import sys
    if "--electron" in sys.argv:
        print("\n=== Electron Desktop Build ===")
        print("⚠️  WAARSCHUWING: Voer dit NIET uit op een corporate/beheerd apparaat!")
        print("    CrowdStrike, SentinelOne, Carbon Black etc. kunnen het EXE-bestand")
        print("    in quarantaine plaatsen en je account blokkeren.\n")
        
        # Check of electron en electron-builder geïnstalleerd zijn
        try:
            subprocess.run(["npx", "electron", "--version"], shell=True, check=True, 
                         capture_output=True, timeout=10)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            print("Electron is niet geïnstalleerd. Installeer eerst:")
            print("  npm install --save-dev electron electron-builder")
            return

        play_mode = "--play" in sys.argv
        
        if play_mode:
            print("Building Player-Only EXE (geen builder UI)...")
            config_flag = "--config electron-builder-play.json"
        else:
            print("Building Full Builder EXE...")
            config_flag = ""
        
        try:
            cmd = f"npx electron-builder {config_flag}".strip()
            subprocess.run(cmd, shell=True, check=True)
            output_dir = "electron-dist-player" if play_mode else "electron-dist"
            print(f"\nElectron EXE succesvol gebouwd in '{output_dir}/'")
            print("💡 TIP: Kopieer het EXE-bestand naar een persoonlijke USB-drive,")
            print("        NIET naar het bestandssysteem van een corporate apparaat.")
        except subprocess.CalledProcessError as e:
            print(f"Electron build mislukt: {e}")

if __name__ == "__main__":
    build_package()