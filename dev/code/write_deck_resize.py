from PIL import Image, ImageDraw, ImageFont
import os
import shutil
from datetime import datetime

def generate_cards():
    # card dimensions and layout
    scale = 4
    card_width = 56 * scale
    card_height = 78 * scale
    card_spacing = 1 * scale # 0 for tight deck spritesheet
    cards_across = 3
    
    # suit colours (hearts, diamonds, spades, clubs)
    suit_colours = [
        (90, 90, 90), # clubs - dark grey
        (237, 74, 123), # diamonds - light red 
        (255, 15, 15),   # hearts - red
        (20, 20, 20)    # spades - black
    ]
    
    # card values for each suit
    card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K']

    suit_symbols = ['♣', '♦', '♥', '♠']  # clubs, diamonds, hearts, spades
    suit_letters = ['c', 'd', 'h', 's']

    # load blank cards deck image
    # old version had 1-pixel black border on each card
    input_path = "dev/art/cards_blank_56x78_corner-7_edge-0_scale-4.png"
    output_path = "public/assets/images/cards_edge-0-top-1_alias-4.png"
    # output_path = "public/assets/images/cards_edge-0_alias-4.png"

    # version for 4x big image
    # output_path = "public/assets/images/cards_edge-0_scale-4.png"
    
    try:
        img = Image.open(input_path)
        draw = ImageDraw.Draw(img)
        # font for placeholder text
        phFont = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 38 * scale)
        # font for top-left identifier
        fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20 * scale)      
        
        # generate 52 cards (4 suits × 13 values)
        card_position = 0
        
        for suit_index, colour in enumerate(suit_colours):
            symbol = suit_symbols[suit_index]
            suitLetter = suit_letters[suit_index]

            for value in card_values:
                if card_position >= 52:
                    break
                    
                # calculate grid position
                row = card_position // cards_across
                col = card_position % cards_across

                # get card top left corner
                xt = card_spacing + col * (card_width + card_spacing)
                yt = card_spacing + row * (card_height + card_spacing)
              
                # get card centre, in pixels
                x = card_spacing + col * (card_width + card_spacing) + card_width // 2
                y = card_spacing + row * (card_height + card_spacing) + card_height // 2
                
                # draw text centred, get text bounding box
                bbox = draw.textbbox((0, 0), value, font=phFont)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]

                # 1. Colored rectangle (card area minus a white margin)
                # Placeholder will be replaced by Suit theme art
                margin = 8 * scale
                topmargin = 22 * scale
                rect_x1 = x - card_width//2 + margin
                rect_y1 = y - card_height//2 + topmargin 
                rect_x2 = x + card_width//2 - margin
                rect_y2 = y + card_height//2 - margin

                # draw.rectangle([rect_x1, rect_y1, rect_x2, rect_y2], fill=colour)
                graphic_y = rect_y1 + 4 * scale  # start below top area
                graphic_height = (rect_y2 - rect_y1) - 15 * scale # most of the remaining card height
                draw.rounded_rectangle([rect_x1, graphic_y, rect_x2, rect_y2], 
                                      radius=9 * scale, fill=colour, outline=colour, width=1)

                # 2. White text super-imposed on colour rectangle
                text_x = x - text_width // 2
                text_y = y - text_height // 2 + 4

                draw.text((text_x, text_y), suitLetter, fill=(255,255,255), font=phFont)

                # 3. Small identifiers visible when card stacked
                draw.text((xt + 7 * scale, yt + 0 * scale), value, fill=colour, font=fontsmall)

                #4. suit symbol, diamond small in font
                if (suitLetter == 'd'):
                  fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 26 * scale)    
                else:
                  fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24 * scale)

                topIndent = -4 * scale
                rightIndent = 21 * scale

                if (suitLetter == 'h'):
                  topIndent = topIndent + 1 * scale
                  rightIndent = rightIndent + 2 * scale

                elif (suitLetter == 'c'):
                  topIndent = topIndent
                  rightIndent = rightIndent + 3 * scale

                elif (suitLetter == 'd'):
                  topIndent = topIndent - 1 * scale

                draw.text((xt + card_width - rightIndent, yt + topIndent), symbol, fill=colour, font=fontSymbol)
                
                card_position += 1
        
        # backup existing file before saving
        if os.path.exists(output_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M")
            backup_path = f"dev/art/archive/cards_{timestamp}.png"
            shutil.copy2(output_path, backup_path)
            print(f"Backed up existing cards image to: {backup_path}")

        # resize down to 56x78 cards with best quality
        final_width = img.width // scale
        final_height = img.height // scale
        img = img.resize((final_width, final_height), Image.Resampling.LANCZOS)

        # add top and top-corners edge/border
        draw_final = ImageDraw.Draw(img)
        corner_radius = 7

        for card_num in range(57):  # all cards including backs
            row = card_num // cards_across
            col = card_num % cards_across
            
            card_spacing_final = 1
            card_width_final = 56
            card_height_final = 78
            
            x = card_spacing_final + col * (card_width_final + card_spacing_final)
            y = card_spacing_final + row * (card_height_final + card_spacing_final)
            
            # draw rounded border - arc for top left corner
            draw_final.arc([x, y, x + corner_radius*2, y + corner_radius*2], 
                          180, 270, fill=(0, 0, 0, 77), width=1)
            
            # straight line across top (between corners)
            draw_final.line([(x + corner_radius, y), (x + card_width_final - corner_radius - 1, y)], 
                            fill=(0, 0, 0, 77), width=1)
            
            # arc for top right corner
            draw_final.arc([x + card_width_final - corner_radius*2 - 1, y, 
                            x + card_width_final - 1, y + corner_radius*2], 
                          270, 0, fill=(0, 0, 0, 77), width=1)

        # save the result
        img.save(output_path)
        print(f"Generated cards saved to: {output_path}")
        print(f"Created {card_position} cards")
        
    except FileNotFoundError:
        print(f"Error: Could not find input file: {input_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_cards()
