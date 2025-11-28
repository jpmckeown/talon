from PIL import Image
import os
import shutil
from datetime import datetime


def add_alternate_back():
    scale = 2
    card_width = 56 * scale
    card_height = 78 * scale
    card_spacing = 1 * scale
    cards_across = 3
    
    # input is deck after feather back added
    input_path = "public/assets/images/cards_edge-0-top-1_scale-2_back.png"
    output_path = "public/assets/images/cards_edge-0-top-1_scale-2_backs.png"
    alternate_back_path = "public/assets/images/card-back-alternate.png"
    
    img = Image.open(input_path)
    alternate_img = Image.open(alternate_back_path)
    
    if alternate_img.mode != 'RGBA':
        alternate_img = alternate_img.convert('RGBA')
    
    # frame 55 is middle of bottom row
    card_position = 55
    row = card_position // cards_across
    col = card_position % cards_across
    
    # card top left corner
    xt = card_spacing + col * (card_width + card_spacing)
    yt = card_spacing + row * (card_height + card_spacing)
    
    # if size not matching, resize back image to match card dimensions
    if alternate_img.size != (card_width, card_height):
        alternate_img = alternate_img.resize((card_width, card_height), Image.Resampling.LANCZOS)
    
    if alternate_img.mode == 'RGBA':
        img.paste(alternate_img, (xt, yt), alternate_img.split()[3])
    else:
        img.paste(alternate_img, (xt, yt))
    
    # backup before overwriting
    if os.path.exists(output_path):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        backup_path = f"dev/art/archive/cards_alternate_backs_{timestamp}.png"
        os.makedirs("dev/art/archive", exist_ok=True)
        shutil.copy2(output_path, backup_path)
        print(f"Backed up existing file to: {backup_path}")
    
    img.save(output_path)


if __name__ == "__main__":
    add_alternate_back()
