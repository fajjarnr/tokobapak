export interface MockProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  soldCount: number
  category: string
}

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'p1', name: 'Kaos Polos Katun Combed 30s', price: 99000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', rating: 4.8, soldCount: 12500, category: 'Fashion' },
  { id: 'p2', name: 'Sepatu Sneakers Pria Casual', price: 450000, originalPrice: 550000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', rating: 4.9, soldCount: 9800, category: 'Fashion' },
  { id: 'p3', name: 'Tas Ransel Waterproof 20L', price: 250000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', rating: 4.7, soldCount: 6200, category: 'Fashion' },
  { id: 'p4', name: 'Headset Gaming RGB 7.1', price: 350000, originalPrice: 420000, image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500', rating: 4.6, soldCount: 5400, category: 'Elektronik' },
  { id: 'p5', name: 'AirPods Pro 2nd Gen', price: 3499000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', rating: 4.9, soldCount: 11200, category: 'Elektronik' },
  { id: 'p6', name: 'Nike Air Jordan 1 Retro', price: 2899000, originalPrice: 3299000, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=500', rating: 4.8, soldCount: 8700, category: 'Fashion' },
  { id: 'p7', name: 'Dyson V15 Detect Vacuum', price: 12999000, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500', rating: 4.9, soldCount: 3200, category: 'Rumah Tangga' },
  { id: 'p8', name: 'Lego Star Wars Millennium Falcon', price: 2499000, originalPrice: 2999000, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=500', rating: 4.7, soldCount: 4100, category: 'Mainan' },
  { id: 'p9', name: 'Kemeja Flanel Pria Lengan Panjang', price: 199000, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', rating: 4.6, soldCount: 7600, category: 'Fashion' },
  { id: 'p10', name: 'Celana Jeans Slim Fit', price: 279000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', rating: 4.5, soldCount: 6800, category: 'Fashion' },
  { id: 'p11', name: 'Smartwatch AMOLED 1.4"', price: 899000, originalPrice: 1199000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', rating: 4.7, soldCount: 9200, category: 'Elektronik' },
  { id: 'p12', name: 'Powerbank 20000mAh Fast Charge', price: 299000, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', rating: 4.8, soldCount: 10500, category: 'Elektronik' },
  { id: 'p13', name: 'Tumbler Stainless Steel 500ml', price: 129000, image: 'https://images.unsplash.com/photo-1523369364227-24934b335841?w=500', rating: 4.9, soldCount: 8300, category: 'Rumah Tangga' },
  { id: 'p14', name: 'Sepatu Running Wanita', price: 399000, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', rating: 4.6, soldCount: 5900, category: 'Fashion' },
  { id: 'p15', name: 'Tas Selempang Kulit', price: 450000, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', rating: 4.7, soldCount: 4700, category: 'Fashion' },
  { id: 'p16', name: 'Keyboard Mechanical RGB', price: 599000, image: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=500', rating: 4.8, soldCount: 6300, category: 'Elektronik' },
  { id: 'p17', name: 'Mouse Wireless Ergonomic', price: 199000, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', rating: 4.6, soldCount: 7100, category: 'Elektronik' },
  { id: 'p18', name: 'Baju Tidur Anak Katun', price: 89000, image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500', rating: 4.9, soldCount: 9800, category: 'Fashion' },
  { id: 'p19', name: 'Mainan Edukasi Kayu', price: 149000, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500', rating: 4.8, soldCount: 5400, category: 'Mainan' },
  { id: 'p20', name: 'Blender Multifungsi 1.5L', price: 399000, originalPrice: 499000, image: 'https://images.unsplash.com/photo-1571235732214-df683c6c350f?w=500', rating: 4.5, soldCount: 3800, category: 'Rumah Tangga' },
  { id: 'p21', name: 'Hijab Voal Premium', price: 75000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', rating: 4.9, soldCount: 11200, category: 'Fashion' },
  { id: 'p22', name: 'Jam Tangan Analog Kulit', price: 599000, image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500', rating: 4.7, soldCount: 4600, category: 'Fashion' },
  { id: 'p23', name: 'Speaker Bluetooth Portable', price: 299000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', rating: 4.6, soldCount: 5900, category: 'Elektronik' },
  { id: 'p24', name: 'Set Panci Stainless 3pcs', price: 899000, originalPrice: 1099000, image: 'https://images.unsplash.com/photo-1585515656558-35580f574238?w=500', rating: 4.7, soldCount: 2700, category: 'Rumah Tangga' },
]
