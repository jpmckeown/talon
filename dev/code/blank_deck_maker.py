from PIL import Image, ImageDraw
import os


def create_blank_cards_template():
    """create blank playing cards template at 56x78px per card"""
    
    # card and layout dimensions
    card_width = 56
    card_height = 78
    cards_across = 3
    cards_down = 19
    border_size = 1
    card_spacing = 0  # no spacing between cards for cleaner generation
    
    # calculate total image size
    total_width = border_size * 2 + cards_across * card_width + card_spacing * (cards_across - 1)
    total_height = border_size * 2 + cards_down * card_height + card_spacing * (cards_down - 1)
    
    print(f"creating blank cards template: {total_width}x{total_height}px")
    print(f"card size: {card_width}x{card_height}px")
    
    # create image with transparency
    img = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))  # transparent background
    draw = ImageDraw.Draw(img)
    
    # card settings
    fill_colour = (255, 250, 240, 255)  # slightly cream white
    corner_radius = 7  # rounded corners
    margin = 2  # internal margin from frame edge
    outline_colour = (0, 0, 0, 255)  # thin black border
    stroke_width = 1  # thin border
    
    # draw each card
    for row in range(cards_down):
        for col in range(cards_across):
            # calculate card position with internal margin
            x = border_size + col * (card_width + card_spacing) + margin
            y = border_size + row * (card_height + card_spacing) + margin
            
            # draw rounded rectangle for card - outline and fill
            draw_rounded_rectangle(
                            draw, 
                            x, y, 
                            x + card_width - 1 - (margin * 2), 
                            y + card_height - 1 - (margin * 2),
                            corner_radius,
                            fill_colour,
                            outline_colour,
                            stroke_width
                        )
    
    # save the blank template
    output_path = "dev/art/cards_blank_56x78_corner-7.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"saved blank cards template: {output_path}")
    
    return output_path


def draw_rounded_rectangle(draw, x1, y1, x2, y2, radius, fill, outline, width):
    """draw rounded rectangle with thin outline"""
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


if __name__ == "__main__":
    template_path = create_blank_cards_template()
    # update_cards_maker_for_new_template()
    print(f"\nBlank template ready at: {template_path}")
    print("Update your cards_maker.py with the changes above, then regenerate your cards!")
