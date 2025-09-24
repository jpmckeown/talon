from PIL import Image, ImageDraw, ImageFont

def test_suit_fonts():
    # create test image
    img_width = 400
    img_height = 300
    img = Image.new('RGB', (img_width, img_height), color='white')
    draw = ImageDraw.Draw(img)
    
    # fonts to test
    test_fonts = [
        ("/System/Library/Fonts/Arial.ttf", "Arial"),
        ("/System/Library/Fonts/Apple Symbols.ttf", "Apple Symbols"),
        # ("/System/Library/Fonts/Supplemental/Segoe UI Symbol.ttf", "Segoe UI Symbol"),
        # ("/System/Library/Fonts/Supplemental/DejaVu Sans.ttf", "DejaVu Sans"),
        ("/System/Library/Fonts/Helvetica.ttc", "Helvetica"),
    ]

    suit_symbols = '♣♦♥♠'
    font_size = 24
    y_pos = 20

    label_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
    
    for font_path, font_name in test_fonts:
        try:
            test_font = ImageFont.truetype(font_path, font_size)

            # draw font name label
            draw.text((10, y_pos), font_name, fill=(100, 100, 100), font=label_font)
            draw.text((180, y_pos - 5), suit_symbols, fill=(0, 0, 0), font=test_font)

            # draw each suit with its colour
            draw.text((270, y_pos - 5), '♣', fill=(90, 90, 90), font=test_font)
            draw.text((295, y_pos - 5), '♦', fill=(237, 74, 123), font=test_font)
            draw.text((320, y_pos - 5), '♥', fill=(255, 15, 15), font=test_font)
            draw.text((345, y_pos - 5), '♠', fill=(20, 20, 20), font=test_font)
            
            y_pos += 40
            
        except Exception as e:
            print(f"couldn't load {font_name}: {e}")
    
    # save test image
    output_path = "dev/art/suitsymbol_test.png"
    img.save(output_path)
    print(f"test image saved to: {output_path}")


if __name__ == "__main__":
    test_suit_fonts()
