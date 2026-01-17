import json
import random
import time
import urllib.request
import urllib.error

# API Endpoint
API_URL = "http://localhost:8080/api/v1/products"

# Categories
CATEGORIES = [
    {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Elektronik", "slug": "elektronik"},
    {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Fashion", "slug": "fashion"},
    {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "Rumah Tangga", "slug": "rumah-tangga"}
]

# Product Name Generators
ADJECTIVES = ["Premium", "Super", "Ultra", "Smart", "Compact", "Pro", "Max", "Mini", "Elite", "Classic", "Modern", "Vintage", "Luxury", "Essential"]
BRANDS = {
    "Elektronik": ["Samsung", "Apple", "Sony", "LG", "Xiaomi", "Asus", "Dell", "HP", "Lenovo", "Logitech"],
    "Fashion": ["Nike", "Adidas", "Uniqlo", "H&M", "Zara", "Levi's", "Gucci", "Supreme", "Batik Keris", "Erigo"],
    "Rumah Tangga": ["IKEA", "Philips", "Miyako", "Cosmos", "Sharp", "Panasonic", "Ace Hardware", "Lock&Lock", "Tupperware"]
}
NOUNS = {
    "Elektronik": ["Smartphone", "Laptop", "Headphones", "Speaker", "Monitor", "Keyboard", "Mouse", "Smartwatch", "Tablet", "Camera", "TV", "Powerbank"],
    "Fashion": ["T-Shirt", "Jeans", "Jacket", "Sneakers", "Watch", "Bag", "Hat", "Dress", "Shirt", "Hoodie", "Socks"],
    "Rumah Tangga": ["Blender", "Rice Cooker", "Fan", "Lamp", "Chair", "Table", "Sofa", "Bed Sheet", "Pillow", "Container", "Vacuum Cleaner"]
}

IMAGE_URLS = {
    "Elektronik": [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
        "https://images.unsplash.com/photo-1588872657578-a3d891952555?w=800&q=80"
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"
    ],
    "Rumah Tangga": [
        "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80",
        "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80",
        "https://images.unsplash.com/photo-1583847661867-7ced4d101d3f?w=800&q=80",
        "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=800&q=80",
        "https://images.unsplash.com/photo-1594218698651-76a0c5bd3e15?w=800&q=80"
    ]
}

def generate_product(index):
    category = random.choice(CATEGORIES)
    cat_name = category["name"]
    
    brand = random.choice(BRANDS[cat_name])
    noun = random.choice(NOUNS[cat_name])
    adjective = random.choice(ADJECTIVES)
    
    name = f"{brand} {adjective} {noun}"
    if random.random() > 0.5:
        name += f" {random.randint(2024, 2026)}"
        
    price = random.randint(50000, 15000000)
    # Make price pretty (e.g. 50000, 99000, 150000)
    if price > 1000000:
        price = (price // 100000) * 100000
    else:
        price = (price // 10000) * 10000
    if random.random() > 0.7:
        price = price - 1000  # 99000 style
        
    description = f"This is a high quality {name}. Perfect for your daily needs. Features include: \n- Durable material\n- Modern design\n- 1 year warranty."
    
    weight = random.randint(100, 5000) / 1000 # kg
    
    payload = {
        "name": name,
        "description": description,
        "price": price,
        "categoryId": category["id"],
        "status": "ACTIVE",
        "weight": weight,
        "dimensions": {
            "length": random.randint(10, 100),
            "width": random.randint(10, 100),
            "height": random.randint(5, 50)
        }
    }
    
    # Add fake image by just printing it for now, as the API might support media separately
    # But based on Entity, media is a separate relation.
    # The CreateProductDto didn't show media field directly, but many APIs accept it.
    # Let's check CreateProductDto again... it didn't have media.
    # So we might need to add media after creation or maybe the controller ignores extra fields.
    # We will just create the product for now.
    
    return payload, category["name"]

def seed_products(count=100):
    print(f"Start seeding {count} products...")
    success_count = 0
    
    for i in range(count):
        product_data, cat_name = generate_product(i)
        
        try:
            req = urllib.request.Request(
                API_URL, 
                data=json.dumps(product_data).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req) as response:
                if response.status == 201:
                    print(f"[{i+1}/{count}] Created: {product_data['name']} ({cat_name})")
                    success_count += 1
                else:
                    print(f"[{i+1}/{count}] Failed: {response.status} {response.read().decode()}")
        except urllib.error.HTTPError as e:
            print(f"[{i+1}/{count}] Error: {e.code} {e.read().decode()}")
        except Exception as e:
            print(f"[{i+1}/{count}] Connection Error: {e}")
            
        # Small delay to not overwhelm
        time.sleep(0.05)
        
    print(f"\nSeeding complete! Successfully created {success_count} products.")

if __name__ == "__main__":
    seed_products(100)
