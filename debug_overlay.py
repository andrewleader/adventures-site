import xml.etree.ElementTree as ET
import html
import re

tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
root = tree.getroot()

for item in root.findall('.//item'):
    title = item.find('title')
    if title is not None and title.text and 'Triassic Sands' in title.text:
        print(f'Found: {title.text}')
        content = item.find('.//content:encoded', {'content': 'http://purl.org/rss/1.0/modules/content/'})
        if content is not None:
            # Look for betacreator blocks and examine all attributes
            if 'betacreator' in content.text:
                print('=== BETACREATOR BLOCK ANALYSIS ===')
                # Find the betacreator div
                start = content.text.find('<div class="wp-block-andrewleader-betacreator')
                if start != -1:
                    # Get the entire div content
                    div_end = content.text.find('</div>', start) + 6
                    betacreator_div = content.text[start:div_end]
                    print('Full betacreator div:')
                    print(betacreator_div[:2000] + '...' if len(betacreator_div) > 2000 else betacreator_div)
                    
                    # Look for all data- attributes
                    print('\n=== ALL DATA ATTRIBUTES ===')
                    all_data_attrs = re.findall(r'data-[^=]*="[^"]*"', betacreator_div)
                    for attr in all_data_attrs:
                        attr_name = attr.split('=')[0]
                        attr_value = attr.split('=', 1)[1]
                        if 'overlay' in attr_name.lower():
                            print(f'OVERLAY ATTRIBUTE: {attr_name}')
                            if 'data:image/' in attr_value:
                                print(f'  Contains base64 image: {attr_value[:100]}...')
                            else:
                                print(f'  Value: {attr_value[:200]}...')
                        elif 'image' in attr_name.lower() or 'topo' in attr_name.lower():
                            print(f'IMAGE/TOPO ATTRIBUTE: {attr_name}')
                            if 'data:image/' in attr_value:
                                print(f'  Contains base64 image: {attr_value[:100]}...')
                            else:
                                print(f'  Value: {attr_value[:200]}...')
                    
                    # Look for base64 image data anywhere in the div
                    if 'data:image/' in betacreator_div:
                        print('\n=== BASE64 IMAGE DATA FOUND ===')
                        # Extract all base64 images
                        base64_pattern = r'data:image/[a-zA-Z]+;base64,([A-Za-z0-9+/=]+)'
                        base64_matches = re.findall(base64_pattern, betacreator_div)
                        for i, match in enumerate(base64_matches):
                            print(f'Base64 image {i+1} length: {len(match)} characters')
                            # Show the attribute it's contained in
                            full_data_url = f'data:image/[^;]+;base64,{re.escape(match)}'
                            containing_attr = re.search(rf'(data-[^=]*)="[^"]*{re.escape(match[:50])}[^"]*"', betacreator_div)
                            if containing_attr:
                                print(f'  Found in attribute: {containing_attr.group(1)}')
        break