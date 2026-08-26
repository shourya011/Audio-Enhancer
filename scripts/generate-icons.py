#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer circle / rounded container
    padding = max(1, int(size * 0.05))
    inner_box = [padding, padding, size - padding, size - padding]
    
    # Background circle with dark gradient feel
    draw.ellipse(inner_box, fill=(15, 23, 42, 255), outline=(56, 189, 248, 200), width=max(1, int(size * 0.05)))
    
    # Draw equalizer spectrum bars in the center
    # 4 bars: heights varying
    bar_count = 5
    bar_width = max(1, int(size * 0.10))
    gap = max(1, int(size * 0.06))
    total_w = bar_count * bar_width + (bar_count - 1) * gap
    start_x = (size - total_w) // 2
    
    # Bar heights relative to size
    height_factors = [0.45, 0.75, 0.90, 0.65, 0.40]
    max_h = int(size * 0.55)
    center_y = size // 2
    
    colors = [
        (14, 165, 233, 255),  # Sky blue
        (56, 189, 248, 255),  # Light blue
        (52, 211, 153, 255),  # Emerald
        (16, 185, 129, 255),  # Green
        (99, 102, 241, 255)   # Indigo
    ]
    
    for i in range(bar_count):
        bx = start_x + i * (bar_width + gap)
        bh = max(2, int(max_h * height_factors[i]))
        by1 = center_y - bh // 2
        by2 = center_y + bh // 2
        
        radius = max(1, bar_width // 2)
        draw.rounded_rectangle([bx, by1, bx + bar_width, by2], radius=radius, fill=colors[i])
        
    return img

os.makedirs('public/icons', exist_ok=True)
for s in [16, 32, 48, 128]:
    icon = create_icon(s)
    icon.save(f'public/icons/icon-{s}.png', 'PNG')
    print(f'Generated public/icons/icon-{s}.png ({s}x{s})')
