
// Minimal polyfill for environment
import { mkdirSync } from 'fs';

if (typeof localStorage === "undefined" || localStorage === null) {
    // Simple in-memory storage if node-localstorage not available
    const storage: Record<string, string> = {};
    global.localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        removeItem: (key: string) => { delete storage[key]; },
        clear: () => { for (const k in storage) delete storage[k]; },
        length: 0,
        key: (index: number) => null
    };
}

// Mock window
if (typeof window === "undefined") {
    (global as any).window = {
        localStorage: global.localStorage
    };
}

import { authApi } from '../lib/api/auth';
import { productApi, categoryApi, CreateProductRequest } from '../lib/api/products';

async function seed() {
    console.log("🌱 Starting Seeding Process...");

    // 1. Authenticate (Register/Login)
    const email = `admin-${Date.now()}@tokobapak.com`;
    const password = 'Password123!';
    const name = 'Admin Seeder';

    let token = '';

    try {
        console.log(`Creating user ${email}...`);
        const regRes = await authApi.register({ email, password, name, confirmPassword: password });
        token = regRes.token;
        console.log("✅ User registered.");
    } catch (e) {
        console.log("User might exist, trying login...");
        try {
            const loginRes = await authApi.login({ email, password });
            token = loginRes.token;
            console.log("✅ Logged in.");
        } catch (err) {
            console.error("❌ Failed to auth", err);
            process.exit(1);
        }
    }

    // Persist token for apiClient
    const authState = { state: { token, user: { email, name } }, version: 0 };
    localStorage.setItem('auth-storage', JSON.stringify(authState));

    // 2. Create Categories
    const categories = [
        { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500&q=80' },
        { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80' },
        { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80' }
    ];

    const categoryIds: Record<string, string> = {};

    console.log("Creating Categories...");
    for (const cat of categories) {
        try {
            // Simplified: We assume create works. In real world we might check if exists.
            const res = await categoryApi.createCategory({ name: cat.name, image: cat.image });
            categoryIds[cat.name] = res.id;
            console.log(`✅ Created Category: ${cat.name}`);
        } catch (e) {
            console.error(`❌ Failed to create category ${cat.name}`, e);
        }
    }

    // 3. Create Products
    const products: CreateProductRequest[] = [
        {
            name: 'Wireless Noise Cancelling Headphones',
            description: 'Premium wireless headphones with industry-leading noise cancellation.',
            price: 3500000,
            categoryId: categoryIds['Electronics'] || '',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80'],
            stock: 50,
            variants: [
                { id: '1', name: 'Color', options: ['Black', 'Silver'] }
            ]
        },
        {
            name: 'Smartphone X Pro 256GB',
            description: 'Latest flagship smartphone with amazing camera and battery life.',
            price: 12000000,
            categoryId: categoryIds['Electronics'] || '',
            images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'],
            stock: 20
        },
        {
            name: 'Men\'s Casual T-Shirt',
            description: 'Comfortable cotton t-shirt for everyday wear.',
            price: 150000,
            categoryId: categoryIds['Fashion'] || '',
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'],
            stock: 100,
            variants: [
                { id: '2', name: 'Size', options: ['S', 'M', 'L', 'XL'] }
            ]
        },
        {
            name: 'Minimalist Sofa',
            description: 'Modern 2-seater sofa, perfect for small apartments.',
            price: 4500000,
            categoryId: categoryIds['Home & Living'] || '',
            images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80'],
            stock: 5
        }
    ];

    console.log("Creating Products...");
    for (const p of products) {
        if (!p.categoryId) {
            console.warn(`Skipping ${p.name}: Category not found`);
            continue;
        }
        try {
            await productApi.createProduct(p);
            console.log(`✅ Created Product: ${p.name}`);
        } catch (e) {
            console.error(`❌ Failed to create product ${p.name}`, e);
        }
    }

    console.log("✨ Seeding Completed!");
}

seed().catch(console.error);
