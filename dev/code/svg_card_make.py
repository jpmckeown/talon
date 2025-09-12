import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

def create_svg_card(value, colour_rgb, filename):
    """generate a single SVG card for testing"""
    card_width = 70
    card_height = 100
    
    # create SVG root
    svg = ET.Element('svg')
    svg.set('width', str(card_width))
    svg.set('height', str(card_height))
    svg.set('xmlns', 'http://www.w3.org/2000/svg')
    svg.set('viewBox', f'0 0 {card_width} {card_height}')
    
    # white background
    bg_rect = ET.SubElement(svg, 'rect')
    bg_rect.set('width', str(card_width))
    bg_rect.set('height', str(card_height))
    bg_rect.set('fill', 'white')
    bg_rect.set('stroke', 'black')
    bg_rect.set('stroke-width', '2')
    
    # main card area (coloured rectangle)
    margin = 4
    top_margin = 24
    rect = ET.SubElement(svg, 'rect')
    rect.set('x', str(margin))
    rect.set('y', str(top_margin))
    rect.set('width', str(card_width - 2 * margin))
    rect.set('height', str(card_height - top_margin - margin - 2))
    rect.set('fill', f'rgb{colour_rgb}')
    
    # large centred text
    main_text = ET.SubElement(svg, 'text')
    main_text.set('x', str(card_width // 2))
    main_text.set('y', str(card_height // 2 + 6))  # +6 for vertical centering
    main_text.set('text-anchor', 'middle')
    main_text.set('font-family', 'Arial, sans-serif')
    main_text.set('font-size', '54')
    main_text.set('font-weight', 'bold')
    main_text.set('fill', 'white')
    main_text.text = value
    
    # small identifier in top-left for stacking
    small_text = ET.SubElement(svg, 'text')
    small_text.set('x', '6')
    small_text.set('y', '18')
    small_text.set('font-family', 'Arial, sans-serif')
    small_text.set('font-size', '24')
    small_text.set('font-weight', 'bold')
    small_text.set('fill', f'rgb{colour_rgb}')
    small_text.text = value
    
    # placeholder for team member graphic (bottom area)
    placeholder = ET.SubElement(svg, 'rect')
    placeholder.set('x', str(margin))
    placeholder.set('y', str(card_height - 20))
    placeholder.set('width', str(card_width - 2 * margin))
    placeholder.set('height', '16')
    placeholder.set('fill', 'none')
    placeholder.set('stroke', f'rgb{colour_rgb}')
    placeholder.set('stroke-width', '1')
    placeholder.set('stroke-dasharray', '3,3')
    
    # add comment for PNG insertion point
    comment = ET.Comment(' PNG graphic would be inserted here as: <image href="graphic.png" x="4" y="76" width="62" height="20"/> ')
    svg.append(comment)
    
    # pretty print and save
    rough_string = ET.tostring(svg, 'unicode')
    reparsed = minidom.parseString(rough_string)
    pretty_svg = reparsed.toprettyxml(indent="  ")
    
    # remove extra whitespace from pretty print
    lines = [line for line in pretty_svg.split('\n') if line.strip()]
    clean_svg = '\n'.join(lines)
    
    with open(filename, 'w') as f:
        f.write(clean_svg)
    
    print(f"created SVG card: {filename}")


def convert_svg_to_png(svg_filename, png_filename):
    """convert SVG to PNG using cairosvg (install with: pip install cairosvg)"""
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_filename, write_to=png_filename)
        print(f"converted to PNG: {png_filename}")
        return True
    except ImportError:
        print("cairosvg not installed. install with: pip install cairosvg")
        return False
    except Exception as e:
        print(f"conversion error: {e}")
        return False


if __name__ == "__main__":
    # test with ace of hearts (red)
    colour = (255, 15, 15)  # red from your original code
    
    # ensure output directory exists
    os.makedirs("dev/art/test", exist_ok=True)
    
    svg_file = "dev/art/test/test_card.svg"
    png_file = "dev/art/test/test_card.png"
    
    # create the SVG
    create_svg_card("A", colour, svg_file)
    
    # try to convert to PNG
    converted = convert_svg_to_png(svg_file, png_file)
    
    if not converted:
        print("\nTo convert SVG to PNG, install cairosvg:")
        print("pip install cairosvg")
        print("\nAlternatively, you can:")
        print("1. open the SVG in a browser and export as PNG")
        print("2. use online converters")
        print("3. use inkscape command line")
