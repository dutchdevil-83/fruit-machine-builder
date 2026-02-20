import numpy as np
from PIL import Image

def analyze_sprites():
    img = Image.open('public/sprites.png').convert('RGB')
    arr = np.array(img).astype(np.int32)
    bg = np.array([254, 254, 254])
    
    # Calculate difference from bg
    diff = np.sum(np.abs(arr - bg), axis=2)
    mask = diff > 30  # threshold
    
    # Project on X and Y
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
    
    print(f"Found {len(rows)} rows: {rows}")
    print(f"Found {len(cols)} cols: {cols}")

if __name__ == "__main__":
    analyze_sprites()
