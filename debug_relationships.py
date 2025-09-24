#!/usr/bin/env python3

import xml.etree.ElementTree as ET
import re
import html
import json

def debug_relationships_and_images():
    print("Analyzing WordPress XML for relationships and images...")
    
    tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
    root = tree.getroot()
    
    namespaces = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }
    
    items = root.findall('.//item')
    
    # Find some example content to analyze
    route_examples = []
    area_examples = []
    plan_examples = []
    report_examples = []
    
    print("Looking for relationship examples...")
    
    for item in items:  # Check all items
        post_type_elem = item.find('wp:post_type', namespaces)
        title_elem = item.find('title')
        
        if post_type_elem is None or title_elem is None:
            continue
            
        post_type = post_type_elem.text
        title = title_elem.text
        
        if post_type == 'routes' and len(route_examples) < 3:
            route_examples.append((title, item))
        elif post_type == 'areas' and len(area_examples) < 3:
            area_examples.append((title, item))
        elif post_type == 'plans' and len(plan_examples) < 3:
            plan_examples.append((title, item))
        elif post_type == 'reports' and len(report_examples) < 3:
            report_examples.append((title, item))
    
    print(f"Found {len(route_examples)} routes, {len(area_examples)} areas, {len(plan_examples)} plans, {len(report_examples)} reports")
    
    # Analyze route relationships
    print("\n=== ROUTE RELATIONSHIP ANALYSIS ===")
    for title, item in route_examples:
        print(f"\nRoute: {title}")
        postmetas = item.findall('wp:postmeta', namespaces)
        
        print(f"  Total postmeta fields: {len(postmetas)}")
        for meta in postmetas:
            key_elem = meta.find('wp:meta_key', namespaces)
            value_elem = meta.find('wp:meta_value', namespaces)
            
            if key_elem is not None and value_elem is not None:
                key = key_elem.text
                value = value_elem.text or ""
                
                # Look for relationship fields or show all fields for first route
                if title == route_examples[0][0]:  # Show all fields for first route
                    print(f"  {key}: {value[:100]}...")
                elif any(rel_word in key.lower() for rel_word in ['area', 'parent', 'location', 'peak', 'destination']):
                    print(f"  {key}: {value[:100]}...")
    
    # Analyze plan relationships  
    print("\n=== PLAN RELATIONSHIP ANALYSIS ===")
    for title, item in plan_examples:
        print(f"\nPlan: {title}")
        postmetas = item.findall('wp:postmeta', namespaces)
        
        print(f"  Total postmeta fields: {len(postmetas)}")
        for meta in postmetas:
            key_elem = meta.find('wp:meta_key', namespaces)
            value_elem = meta.find('wp:meta_value', namespaces)
            
            if key_elem is not None and value_elem is not None:
                key = key_elem.text
                value = value_elem.text or ""
                
                # Show all fields for first plan
                if title == plan_examples[0][0]:
                    print(f"  {key}: {value[:100]}...")
                elif any(rel_word in key.lower() for rel_word in ['route', 'destination', 'area', 'peak']):
                    print(f"  {key}: {value[:100]}...")
    
    # Analyze images and betacreator
    print("\n=== IMAGE AND BETACREATOR ANALYSIS ===")
    betacreator_count = 0
    image_count = 0
    
    for title, item in route_examples + area_examples + report_examples:
        content_elem = item.find('content:encoded', namespaces)
        if content_elem is not None and content_elem.text:
            content = content_elem.text
            
            # Look for images
            img_matches = re.findall(r'<img[^>]*src="([^"]*)"[^>]*>', content)
            if img_matches:
                image_count += len(img_matches)
                if len(img_matches) <= 3:  # Show if few images
                    print(f"\nImages in {title}:")
                    for img_url in img_matches:
                        print(f"  {img_url}")
                else:
                    print(f"\n{title} has {len(img_matches)} images")
            
            # Look for betacreator with more flexible regex
            betacreator_matches = re.findall(r'<div[^>]*betacreator[^>]*>', content)
            if betacreator_matches:
                betacreator_count += len(betacreator_matches)
                print(f"\nBetacreator blocks in {title}: {len(betacreator_matches)}")
                
                # Find the data-topo attribute
                data_topo_matches = re.findall(r'data-topo="([^"]*)"', content)
                for i, data_topo in enumerate(data_topo_matches[:1]):  # Show first one
                    try:
                        # Unescape HTML entities
                        unescaped = html.unescape(data_topo)
                        print(f"  Block {i+1} data-topo (first 300 chars): {unescaped[:300]}...")
                    except:
                        print(f"  Block {i+1} data-topo (raw): {data_topo[:200]}...")
            
            # Look for featured images in postmeta
            postmetas = item.findall('wp:postmeta', namespaces)
            for meta in postmetas:
                key_elem = meta.find('wp:meta_key', namespaces)
                value_elem = meta.find('wp:meta_value', namespaces)
                
                if key_elem is not None and value_elem is not None:
                    key = key_elem.text
                    value = value_elem.text or ""
                    
                    if 'thumbnail' in key.lower() or ('image' in key.lower() and value):
                        print(f"  Featured image meta {key}: {value}")
    
    print(f"\nSUMMARY:")
    print(f"Total images found: {image_count}")
    print(f"Total betacreator blocks found: {betacreator_count}")

if __name__ == "__main__":
    debug_relationships_and_images()