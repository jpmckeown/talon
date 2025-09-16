# older script making PNG of cards the same size as in Tutorial
from PIL import Image, ImageDraw, ImageFont
import os
import shutil
from datetime import datetime

def generate_cards():
    # card dimensions and layout
    card_width = 35
    card_height = 50
    cards_across = 3
    border_size = 1
    card_spacing = 2
    
    # suit colours (hearts, diamonds, spades, clubs)
    suit_colours = [
        (90, 90, 90), # clubs - dark grey
        # (100, 150, 255), # clubs - light blue
        (237, 74, 123), # diamonds - light red 
        (255, 15, 15),   # hearts - red
        # (68, 51, 194)    # spades - blue
        (20, 20, 20)    # spades - black
    ]
    
    # card values for each suit
    card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K']

    suit_symbols = ['♣', '♦', '♥', '♠']  # clubs, diamonds, hearts, spades
    suit_letters = ['c', 'd', 'h', 's']

    # load blank cards image
    input_path = "dev/art/cards_blank.png"
    output_path = "public/assets/images/cards.png"
    
    try:
        img = Image.open(input_path)
        draw = ImageDraw.Draw(img)
        phFont = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        fontsmall = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 13)
        fontSymbol = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 15)
        
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
                xt = border_size + col * (card_width + card_spacing) 
                yt = border_size + row * (card_height + card_spacing) 
              
                # get card centre, in pixels
                x = border_size + col * (card_width + card_spacing) + card_width // 2
                y = border_size + row * (card_height + card_spacing) + card_height // 2
                
                # draw text centred, get text bounding box
                bbox = draw.textbbox((0, 0), value, font=phFont)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]

                # 1. Colored rectangle (card area minus a white margin)
                # Placeholder will be replaced by Suit theme art
                margin = 2
                topmargin = 14
                rect_x1 = x - card_width//2 + margin
                rect_y1 = y - card_height//2 + topmargin 
                rect_x2 = x + card_width//2 - margin
                rect_y2 = y + card_height//2 - margin
                draw.rectangle([rect_x1, rect_y1, rect_x2, rect_y2], fill=colour)

                # 2. White text super-imposed on colour rectangle
                text_x = x - text_width // 2
                text_y = y - text_height // 2 + 4

                draw.text((text_x, text_y), suitLetter, fill=(255,255,255), font=phFont)

                # 3. Small identifiers visible when card stacked
                draw.text((xt + 3, yt), value, fill=colour, font=fontsmall)
                draw.text((xt + card_width - 11, yt - 3), symbol, fill=colour, font=fontSymbol)
                
                card_position += 1
        
        # backup existing file before saving
        if os.path.exists(output_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M")
            backup_path = f"dev/art/archive/cards_{timestamp}.png"
            shutil.copy2(output_path, backup_path)
            print(f"Backed up existing cards image to: {backup_path}")

        # save the result
        img.save(output_path)
        print(f"Generated cards saved to: {output_path}")
        print(f"Created {card_position} cards")
        print("Card backs (positions 53-57) left unchanged")
        
    except FileNotFoundError:
        print(f"Error: Could not find input file: {input_path}")
        print("Make sure the file exists and path is correct")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_cards()
