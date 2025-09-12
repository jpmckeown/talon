from PIL import Image, ImageDraw, ImageFont
import os


def create_png_card_from_svg_design(value, colour_rgb, filename):
    """create PNG card using the SVG design but with Pillow for sharp rendering"""
    card_width = 70
    card_height = 100
    
    # create high-res image (2x for extra sharpness)
    scale = 2
    img = Image.new('RGB', (card_width * scale, card_height * scale), 'white')
    draw = ImageDraw.Draw(img)
    
    # scale all measurements
    cw = card_width * scale
    ch = card_height * scale
    
    # white background with border
    draw.rectangle([0, 0, cw-1, ch-1], outline='black', width=4)
    
    # main card area (coloured rectangle)
    margin = 4 * scale
    top_margin = 24 * scale
    draw.rectangle([margin, top_margin, cw - margin, ch - margin - 2], fill=colour_rgb)
    
    # load fonts at high resolution
    try:
        # large font for main text
        large_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 54 * scale)
        # small font for identifier
        small_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24 * scale)
    except:
        # fallback fonts
        large_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # large centred text
    bbox = draw.textbbox((0, 0), value, font=large_font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (cw - text_width) // 2
    text_y = (ch - text_height) // 2
    draw.text((text_x, text_y), value, fill='white', font=large_font)
    
    # small identifier in top-left
    draw.text((6 * scale, 18 * scale - text_height//4), value, fill=colour_rgb, font=small_font)
    
    # placeholder for team member graphic (dashed border)
    graphic_y = ch - 20 * scale
    graphic_height = 16 * scale
    # draw dashed rectangle manually
    dash_length = 6
    for x in range(margin, cw - margin, dash_length * 2):
        draw.line([x, graphic_y, min(x + dash_length, cw - margin), graphic_y], fill=colour_rgb, width=2)
        draw.line([x, graphic_y + graphic_height, min(x + dash_length, cw - margin), graphic_y + graphic_height], fill=colour_rgb, width=2)
    
    for y in range(graphic_y, graphic_y + graphic_height, dash_length * 2):
        draw.line([margin, y, margin, min(y + dash_length, graphic_y + graphic_height)], fill=colour_rgb, width=2)
        draw.line([cw - margin, y, cw - margin, min(y + dash_length, graphic_y + graphic_height)], fill=colour_rgb, width=2)
    
    # scale down to final size for crisp result
    img_final = img.resize((card_width, card_height), Image.LANCZOS)
    
    # save PNG
    img_final.save(filename)
    print(f"created sharp PNG card: {filename}")


if __name__ == "__main__":
    # test with ace of hearts
    colour = (255, 15, 15) 
    
    os.makedirs("dev/art/test", exist_ok=True)
    
    png_file = "dev/art/test/test_card_sharp.png"
    
    # makee the PNG 
    create_png_card_from_svg_design("A", colour, png_file)
