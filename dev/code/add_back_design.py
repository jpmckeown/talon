from PIL import Image, ImageDraw, ImageFont
import os
import shutil
from datetime import datetime

def backdesign_paste():
    scale = 2
    card_width = 56 * scale
    card_height = 78 * scale
    card_spacing = 1 * scale
    cards_across = 3
    
    input_path = "public/assets/images/cards_edge-0-top-1_scale-2.png"
    output_path = "public/assets/images/cards_edge-0-top-1_scale-2_back.png"
    img = Image.open(input_path)

    # frame 56 is lowest-rightmost position in deck
    card_position = 56
    row = card_position // cards_across
    col = card_position % cards_across

    # card top left corner
    xt = card_spacing + col * (card_width + card_spacing)
    yt = card_spacing + row * (card_height + card_spacing)

    # centre of card
    x = xt + card_width // 2
    y = yt + card_height // 2

    feather_img = Image.open("public/assets/images/feather.png")
    if feather_img.mode != 'RGBA':
        feather_img = feather_img.convert('RGBA')

    tiles_across = 6
    tiles_down = 9
    tile_size = 16
    tiled_width = tiles_across * tile_size
    tiled_height = tiles_down * tile_size
    start_x = x - tiled_width // 2
    start_y = y - tiled_height // 2

    # tile the feather image
    for row_idx in range(tiles_down):
        for col_idx in range(tiles_across):
            # left/right each side's middle columns has one fewer feathers
            if (col_idx == 1 or col_idx == 4) and row_idx >= 8:
                continue
            tile_x = start_x + col_idx * tile_size
            tile_y = start_y + row_idx * tile_size

            # those middle columns offset down by half a feather
            if col_idx == 1 or col_idx == 4:
                tile_y += 8

            # horizontally flip feathers in right half of card
            if col_idx >= 3:
                flipped_feather = feather_img.transpose(Image.FLIP_LEFT_RIGHT)
                img.paste(flipped_feather, (tile_x, tile_y), flipped_feather.split()[3])
            else:
                img.paste(feather_img, (tile_x, tile_y), feather_img.split()[3])

    img.save(output_path)
    print(f"Back design added to frame 56, saved to: {output_path}")


if __name__ == "__main__":
    backdesign_paste()
