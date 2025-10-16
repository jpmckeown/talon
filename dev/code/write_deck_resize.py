from PIL import Image, ImageDraw, ImageFont
import os
import shutil
from datetime import datetime

def generate_cards():
    # card dimensions and layout
    scale = 2
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
    input_path = "dev/art/cards_blank_56x78_corner-7_edge-0-top-1_scale-2.png"

    output_path = "public/assets/images/cards_edge-0-top-1_scale-2.png"
    
    try:
        img = Image.open(input_path)
        draw = ImageDraw.Draw(img)
        phFont = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 36 * scale)     
        
        # generate 52 cards (4 suits, each 13 values)
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

                # 1. Colored rectangle (card area minus a white sideMargin)
                # Placeholder will be replaced by Suit theme art
                phMargin = 5 * scale
                header = 28 * scale # how much space above graphic

                rect_x1 = x - card_width//2 + phMargin
                rect_y1 = y - card_height//2 + header 
                rect_x2 = x + card_width//2 - phMargin
                rect_y2 = y + card_height//2 - phMargin

                graphic_y = rect_y1 + 4 * scale  # start below top area
                # graphic_height = (rect_y2 - rect_y1) - 15 * scale # most of the remaining card height

                # if suit Spades paste the first-draft owl image on
                if suitLetter == 's':
                  owl_img = Image.open("public/assets/images/owl_1.png")
                  if owl_img.mode != 'RGBA':
                    owl_img = owl_img.convert('RGBA')
                  # centre owl face image which is 96x84
                  owl_x = x - 96 // 2
                  owl_y = y - 84 // 2 + 12 * scale
                  img.paste(owl_img, (owl_x, owl_y), owl_img.split()[3])
                  # img.paste(owl_img, (owl_x, owl_y), owl_img)
                else:
                  draw.rounded_rectangle([rect_x1, graphic_y, rect_x2, rect_y2],
                                      radius=9 * scale, fill=colour, outline=colour, width=1)

                # 2. white text super-imposed on colour rectangle
                if suitLetter != 's':
                  text_x = x - text_width // 2
                  text_y = y - text_height // 2 + 4 * scale
                  draw.text((text_x, text_y), suitLetter, fill=(255,255,255), font=phFont)

                # 3. Small identifiers visible when card stacked
                # font for top-left identifier
                if (value == 'Q'):
                  fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 30 * scale)
                  leftMargin = 4
                else:
                  fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 30 * scale)
                  leftMargin = 6


                draw.text((xt + leftMargin * scale, yt - 2 * scale), value, fill=colour, font=fontsmall)

                #4. suit symbol
                symbolFontSize = 36
                if (suitLetter == 'h'):
                  fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", (symbolFontSize-2) * scale)
                elif (suitLetter == 'c'):
                  fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", (symbolFontSize-2) * scale)     
                else:
                  fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", symbolFontSize * scale)

                topIndent = -7 * scale
                rightIndent = 24 * scale

                if (suitLetter == 'h'):
                  topIndent = topIndent + 1 * scale
                  rightIndent = rightIndent + 2 * scale

                elif (suitLetter == 'c'):
                  topIndent = topIndent + 1 * scale
                  rightIndent = rightIndent + 3 * scale

                elif (suitLetter == 's'):
                  topIndent = topIndent + (-1*scale)

                elif (suitLetter == 'd'):
                  topIndent = topIndent + (0*scale)

                draw.text((xt + card_width - rightIndent, yt + topIndent), symbol, fill=colour, font=fontSymbol)
                
                card_position += 1
        
        # # backup existing file before saving
        # if os.path.exists(output_path):
        #     timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        #     backup_path = f"dev/art/archive/cards_{timestamp}.png"
        #     shutil.copy2(output_path, backup_path)
        #     print(f"Backed up existing cards image to: {backup_path}")

        # # resize down to 56x78 cards with best quality
        # final_width = img.width // scale
        # final_height = img.height // scale
        # img = img.resize((final_width, final_height), Image.Resampling.LANCZOS)

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
