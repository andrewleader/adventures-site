import xml.etree.ElementTree as ET
import phpserialize

# Parse the XML
tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
root = tree.getroot()

print("Looking for 'Life in Space 2023' trip plan...")

# Find 'Life in Space 2023'
for item in root.findall('.//item'):
    title = item.find('title')
    if title is not None and title.text and 'Life in Space 2023' in title.text:
        print(f'Found: {title.text}')
        print("Looking for destinations metadata...")
        
        for meta in item.findall('.//wp:postmeta', {'wp': 'http://wordpress.org/export/1.2/'}):
            key = meta.find('wp:meta_key', {'wp': 'http://wordpress.org/export/1.2/'})
            value = meta.find('wp:meta_value', {'wp': 'http://wordpress.org/export/1.2/'})
            
            if key is not None and key.text == 'destinations':
                print(f'Found destinations metadata: {value.text}')
                try:
                    destinations = phpserialize.loads(value.text.encode('utf-8'))
                    print(f'Parsed destinations: {destinations}')
                except Exception as e:
                    print(f'Error parsing destinations: {e}')
            
            # Also look for other metadata
            if key is not None and key.text:
                print(f'  {key.text}: {value.text if value is not None else "None"}')
        
        break
else:
    print("Trip plan not found")