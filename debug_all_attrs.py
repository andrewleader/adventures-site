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
            # Look for all data- attributes in betacreator blocks
            if 'betacreator' in content.text:
                print('=== SEARCHING FOR ALL DATA ATTRIBUTES ===')
                
                # Find all data- attributes
                data_attrs = re.findall(r'(data-[^=]+)="([^"]*)"', content.text)
                
                for attr_name, attr_value in data_attrs:
                    print(f'\nAttribute: {attr_name}')
                    print(f'Value length: {len(attr_value)}')
                    
                    if 'base64' in attr_value:
                        print('*** CONTAINS BASE64 DATA ***')
                        # Extract just the base64 part
                        base64_match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', attr_value)
                        if base64_match:
                            base64_data = base64_match.group(1)
                            print(f'Base64 data length: {len(base64_data)} characters')
                            print(f'Base64 preview: {base64_data[:50]}...')
                    
                    # Show preview of attribute value
                    if len(attr_value) > 200:
                        print(f'Preview: {attr_value[:200]}...')
                    else:
                        print(f'Full value: {attr_value}')
        break