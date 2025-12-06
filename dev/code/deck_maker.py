from PIL import Image, ImageDraw, ImageFont
import os
import sys
import shutil
import argparse
from datetime import datetime


def get_parameters():
    parser = argparse.ArgumentParser(description='Generate playing card deck with custom borders')
    parser.add_argument('--edge', type=int, help='edge border style (0-3)')
    parser.add_argument('--top', type=int, help='top border style (0-3)')
    parser.add_argument('--base', type=int, help='base/bottom border style (0-3)')
    parser.add_argument('--scale', type=int, help='scale factor (1-2)')
    args = parser.parse_args()

    # prompt for missing parameters with defaults
    if args.edge is None:
        edge_input = input('Enter edge value (0-3) [default: 1]: ').strip()
        args.edge = int(edge_input) if edge_input else 1

    if args.top is None:
        top_input = input('Enter top value (0-3) [default: 1]: ').strip()
        args.top = int(top_input) if top_input else 1

    if args.base is None:
        base_input = input('Enter base value (0-3) [default: 1]: ').strip()
        args.base = int(base_input) if base_input else 1

    if args.scale is None:
        scale_input = input('Enter scale (1-2) [default: 2]: ').strip()
        args.scale = int(scale_input) if scale_input else 2

    # validate ranges
    if not 0 <= args.edge <= 3:
        print(f'Error: edge must be 0-3, got {args.edge}')
        sys.exit(1)
    if not 0 <= args.top <= 3:
        print(f'Error: top must be 0-3, got {args.top}')
        sys.exit(1)
    if not 0 <= args.base <= 3:
        print(f'Error: base must be 0-3, got {args.base}')
        sys.exit(1)
    if not 1 <= args.scale <= 2:
        print(f'Error: scale must be 1-2, got {args.scale}')
        sys.exit(1)

    return args.edge, args.top, args.base, args.scale


def draw_card_faces(img, draw, scale, card_width, card_height, card_spacing):
    cards_across = 3
    
    suit_colours = [
        (90, 90, 90),     # clubs - dark grey
        (237, 74, 123),   # diamonds - light red
        (255, 15, 15),    # hearts - red
        (20, 20, 20)      # spades - black
    ]
    
    card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suit_symbols = ['♣', '♦', '♥', '♠']
    suit_letters = ['c', 'd', 'h', 's']
    
    phFont = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 36 * scale)
    
    card_position = 0
    
    for suit_index, colour in enumerate(suit_colours):
        symbol = suit_symbols[suit_index]
        suitLetter = suit_letters[suit_index]

        for value in card_values:
            if card_position >= 52:
                break

            row = card_position // cards_across
            col = card_position % cards_across

            xt = card_spacing + col * (card_width + card_spacing)
            yt = card_spacing + row * (card_height + card_spacing)
          
            x = card_spacing + col * (card_width + card_spacing) + card_width // 2
            y = card_spacing + row * (card_height + card_spacing) + card_height // 2
            
            bbox = draw.textbbox((0, 0), value, font=phFont)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            phMargin = 5 * scale
            header = 28 * scale

            rect_x1 = x - card_width//2 + phMargin
            rect_y1 = y - card_height//2 + header 
            rect_x2 = x + card_width//2 - phMargin
            rect_y2 = y + card_height//2 - phMargin

            graphic_y = rect_y1 + 4 * scale

            # paste bird images based on suit
            if suitLetter == 's':
                owl_img = Image.open("public/assets/images/owl_1a.png")
                if owl_img.mode != 'RGBA':
                    owl_img = owl_img.convert('RGBA')
                owl_x = x - 96 // 2
                owl_y = y - 84 // 2 + 12 * scale
                img.paste(owl_img, (owl_x, owl_y), owl_img.split()[3])
            
            elif suitLetter == 'c':
                crow_img = Image.open("public/assets/images/crow.png")
                if crow_img.mode != 'RGBA':
                    crow_img = crow_img.convert('RGBA')
                crow_x = x - 96 // 2
                crow_y = y - 84 // 2 + 12 * scale
                img.paste(crow_img, (crow_x, crow_y), crow_img.split()[3])

            elif suitLetter == 'h':
                eagle_img = Image.open("public/assets/images/eagle.png")
                if eagle_img.mode != 'RGBA':
                    eagle_img = eagle_img.convert('RGBA')
                eagle_x = x - 96 // 2
                eagle_y = y - 84 // 2 + 12 * scale
                img.paste(eagle_img, (eagle_x, eagle_y), eagle_img.split()[3])

            elif suitLetter == 'd':
                redkite_img = Image.open("public/assets/images/red-kite-3.png")
                if redkite_img.mode != 'RGBA':
                    redkite_img = redkite_img.convert('RGBA')
                redkite_x = x - 96 // 2
                redkite_y = y - 84 // 2 + 12 * scale
                img.paste(redkite_img, (redkite_x, redkite_y), redkite_img.split()[3])

            # top-left identifiers visible when card stacked
            if value == '10':
                fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 30 * scale)
                line_width = 2 * scale
                line_height = 19 * scale
                line_x = xt + 7 * scale
                line_y = yt + 5 * scale
                draw.rectangle([line_x, line_y, line_x + line_width, line_y + line_height],
                              fill=colour)
                draw.text((xt + 11 * scale, yt - 2 * scale), '0', fill=colour, font=fontsmall)

            elif value == 'Q':
                fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 30 * scale)
                draw.text((xt + 4 * scale, yt - 2 * scale), value, fill=colour, font=fontsmall)
            else:
                fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 30 * scale)
                draw.text((xt + 6 * scale, yt - 2 * scale), value, fill=colour, font=fontsmall)

            # suit symbol
            symbolFontSize = 36
            if suitLetter == 'h':
                fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", (symbolFontSize-2) * scale)
            elif suitLetter == 'c':
                fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", (symbolFontSize-2) * scale) 
            else:
                fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", symbolFontSize * scale)

            topIndent = -7 * scale
            rightIndent = 24 * scale

            if suitLetter == 'h':
                topIndent = topIndent + 1 * scale
                rightIndent = rightIndent + 2 * scale
            elif suitLetter == 'c':
                topIndent = topIndent + 1 * scale
                rightIndent = rightIndent + 3 * scale
            elif suitLetter == 's':
                topIndent = topIndent + (-1*scale)
            elif suitLetter == 'd':
                topIndent = topIndent + (0*scale)

            draw.text((xt + card_width - rightIndent, yt + topIndent), symbol, fill=colour, font=fontSymbol)

            card_position += 1

    return card_position


def add_feather_back(img, scale, card_width, card_height, card_spacing):
    cards_across = 3
    
    card_position = 56
    row = card_position // cards_across
    col = card_position % cards_across

    xt = card_spacing + col * (card_width + card_spacing)
    yt = card_spacing + row * (card_height + card_spacing)

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

    for row_idx in range(tiles_down):
        for col_idx in range(tiles_across):
            if (col_idx == 1 or col_idx == 4) and row_idx >= 8:
                continue
            tile_x = start_x + col_idx * tile_size
            tile_y = start_y + row_idx * tile_size

            if col_idx == 1 or col_idx == 4:
                tile_y += 8

            if col_idx >= 3:
                flipped_feather = feather_img.transpose(Image.FLIP_LEFT_RIGHT)
                img.paste(flipped_feather, (tile_x, tile_y), flipped_feather.split()[3])
            else:
                img.paste(feather_img, (tile_x, tile_y), feather_img.split()[3])


def add_alternate_back(img, scale, card_width, card_height, card_spacing):
    cards_across = 3

    alternate_back_path = "public/assets/images/card-back-alternate.png"
    alternate_img = Image.open(alternate_back_path)

    if alternate_img.mode != 'RGBA':
        alternate_img = alternate_img.convert('RGBA')

    card_position = 55
    row = card_position // cards_across
    col = card_position % cards_across
    
    xt = card_spacing + col * (card_width + card_spacing)
    yt = card_spacing + row * (card_height + card_spacing)
    
    if alternate_img.size != (card_width, card_height):
        alternate_img = alternate_img.resize((card_width, card_height), Image.Resampling.LANCZOS)
    
    if alternate_img.mode == 'RGBA':
        img.paste(alternate_img, (xt, yt), alternate_img.split()[3])
    else:
        img.paste(alternate_img, (xt, yt))


def generate_deck():
    edge, top, base, scale = get_parameters()
    
    card_width = 56 * scale
    card_height = 78 * scale
    card_spacing = 1 * scale
    
    input_filename = f"cards_blank_56x78_corner-7_edge-{edge}-top-{top}-base-{base}_scale-{scale}.png"
    input_path = f"dev/art/{input_filename}"
    
    output_filename = f"cards_edge-{edge}-top-{top}-base-{base}_scale-{scale}.png"
    output_path = f"public/assets/images/{output_filename}"
    
    if not os.path.exists(input_path):
        print(f'Error: blank template not found: {input_path}')
        sys.exit(1)
    
    print(f'Loading blank template: {input_filename}')
    print(f'Parameters: edge={edge}, top={top}, base={base}, scale={scale}')
    
    try:
        img = Image.open(input_path)
        draw = ImageDraw.Draw(img)
        
        print('Drawing card faces...')
        card_count = draw_card_faces(img, draw, scale, card_width, card_height, card_spacing)
        print(f'Created {card_count} card faces')
        
        print('Adding feather back design (frame 56)...')
        add_feather_back(img, scale, card_width, card_height, card_spacing)
        
        print('Adding alternate back design (frame 55)...')
        add_alternate_back(img, scale, card_width, card_height, card_spacing)
        
        if os.path.exists(output_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M")
            backup_path = f"dev/art/archive/cards_{timestamp}.png"
            os.makedirs("dev/art/archive", exist_ok=True)
            shutil.copy2(output_path, backup_path)
            print(f'Backed up existing file to: {backup_path}')
        
        img.save(output_path)
        print(f'\nGenerated deck saved to: {output_path}')
        
    except FileNotFoundError as e:
        print(f'Error: required image file not found: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'Error: {e}')
        sys.exit(1)


if __name__ == "__main__":
    generate_deck()
