from PIL import Image, ImageDraw
import os


def create_blank_cards_template():
    """make deck of blank playing cards at 56 by 78 pixels per card"""
    scale = 2
    card_width = 56 * scale
    card_height = 78 * scale
    cards_across = 3
    cards_down = 19
    border_size = 0
    card_spacing = 1 * scale  # spacing between card frames
    
    # calculate total image size
    total_width = cards_across * card_width + (cards_across + 1) * card_spacing
    total_height = cards_down * card_height + (cards_down + 1) * card_spacing
    
    print(f"Making blank cards template: {total_width}x{total_height}px")
    print(f"Card size: {card_width}x{card_height}px")
    
    # make image with transparency
    img = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))  # transparent background
    draw = ImageDraw.Draw(img)
    
    # card settings
    fill_colour = (255, 250, 240, 255)  # cream white
    corner_radius = 7 * scale # rounded corners

    ## border essential when cards are stacked or otherwise overlap.
    outline_colour = (0, 0, 0, 255)  # black
    stroke_width = border_size
    
    # draw each card
    for row in range(cards_down):
        for col in range(cards_across):
          # calculate card position
          x = card_spacing + col * (card_width + card_spacing)
          y = card_spacing + row * (card_height + card_spacing)
            
          # draw rounded rectangle for card - outline and fill
          draw_rounded_rectangle(
                          draw, 
                          x, y, 
                          x + card_width - 1,   #1*scale, 
                          y + card_height - 1,   #1*scale,
                          corner_radius,
                          fill_colour,
                          outline_colour,
                          stroke_width
                      )
          
    # after drawing all cards, add top borders
    for row in range(cards_down):
        for col in range(cards_across):
            # calculate card position
            x = card_spacing + col * (card_width + card_spacing)
            y = card_spacing + row * (card_height + card_spacing)
            
            border_size = 2
            border_colour = (0, 0, 0, 100)  # black
            
            # top-left corner arc
            draw.arc(
                [x, y, x + corner_radius * 2, y + corner_radius * 2],
                180, 270,
                fill=border_colour,
                width=border_size
            )
            
            # straight line across top (between corners)
            draw.line(
                [(x + corner_radius, y), (x + card_width - corner_radius - 1, y)],
                fill=border_colour,
                width=border_size
            )
            
            # top-right corner arc
            draw.arc(
                [x + card_width - corner_radius * 2 - 1, y, 
                x + card_width - 1, y + corner_radius * 2],
                270, 0,
                fill=border_colour,
                width=border_size
            )
    
    # save the blank template
    #output_path = "dev/art/cards_blank_56x78_corner-7_edge-0_scale-4.png"
    output_path = "dev/art/cards_blank_56x78_corner-7_edge-0-top-1_scale-2.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Saved blank cards template at: {output_path}")
    
    return output_path


def draw_rounded_rectangle(draw, x1, y1, x2, y2, radius, fill, outline, width):
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


if __name__ == "__main__":
    template_path = create_blank_cards_template()
    print(f"\nBlank template ready at: {template_path}")
