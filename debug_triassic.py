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
            # Look for betacreator blocks
            if 'data-betacreator' in content.text:
                print('=== BETACREATOR DATA FOUND ===')
                # Extract the betacreator data using regex
                pattern = r'data-betacreator="([^"]*)"'
                matches = re.findall(pattern, content.text)
                for i, match in enumerate(matches):
                    print(f'\nBetacreator block {i+1}:')
                    decoded = html.unescape(match)
                    print(decoded[:1000] + '...' if len(decoded) > 1000 else decoded)
            else:
                print('No betacreator data found in this item')
                # Show a sample of the content
                print('Sample content:')
                # Look for betacreator blocks manually
                if 'betacreator' in content.text:
                    print('Found betacreator mention!')
                    # Find the betacreator block
                    start = content.text.find('andrewleader/betacreator')
                    if start != -1:
                        # Get a larger chunk around the betacreator block
                        block_start = max(0, start - 100)
                        block_end = min(len(content.text), start + 2000)
                        print('Betacreator block area:')
                        print(content.text[block_start:block_end])
                else:
                    print(content.text[:500] + '...' if len(content.text) > 500 else content.text)
        break