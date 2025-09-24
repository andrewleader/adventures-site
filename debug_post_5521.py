import xml.etree.ElementTree as ET

# Parse the XML
tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
root = tree.getroot()

print("Looking for post ID 5521...")

# Find post with ID 5521
for item in root.findall('.//item'):
    post_id = item.find('.//wp:post_id', {'wp': 'http://wordpress.org/export/1.2/'})
    if post_id is not None and post_id.text == '5521':
        title = item.find('title')
        post_type = item.find('.//wp:post_type', {'wp': 'http://wordpress.org/export/1.2/'})
        post_name = item.find('.//wp:post_name', {'wp': 'http://wordpress.org/export/1.2/'})
        
        print(f'Found post ID 5521:')
        print(f'  Title: {title.text if title is not None else "None"}')
        print(f'  Type: {post_type.text if post_type is not None else "None"}')
        print(f'  Name: {post_name.text if post_name is not None else "None"}')
        break
else:
    print("Post ID 5521 not found")