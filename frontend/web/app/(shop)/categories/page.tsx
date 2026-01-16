import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Laptop, Shirt, Home, Sparkles, Trophy, Gamepad2, Smartphone, Watch } from 'lucide-react'

// Mock Categories Data
const ALL_CATEGORIES = [
    {
        name: 'Electronics',
        icon: Laptop,
        color: 'bg-blue-100 text-blue-600',
        href: '/products?category=Electronics',
        subcategories: ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Accessories']
    },
    {
        name: 'Fashion',
        icon: Shirt,
        color: 'bg-pink-100 text-pink-600',
        href: '/products?category=Fashion',
        subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Watches']
    },
    {
        name: 'Home & Living',
        icon: Home,
        color: 'bg-amber-100 text-amber-600',
        href: '/products?category=Home',
        subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting']
    },
    {
        name: 'Beauty',
        icon: Sparkles,
        color: 'bg-purple-100 text-purple-600',
        href: '/products?category=Beauty',
        subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Tools']
    },
    {
        name: 'Sports',
        icon: Trophy,
        color: 'bg-emerald-100 text-emerald-600',
        href: '/products?category=Sports',
        subcategories: ['Gym', 'Running', 'Cycling', 'Outdoor', 'Team Sports']
    },
    {
        name: 'Toys & Hobbies',
        icon: Gamepad2,
        color: 'bg-orange-100 text-orange-600',
        href: '/products?category=Toys',
        subcategories: ['Action Figures', 'Board Games', 'Dolls', 'Educational', 'Puzzles']
    },
    {
        name: 'Gadgets',
        icon: Smartphone,
        color: 'bg-cyan-100 text-cyan-600',
        href: '/products?category=Gadgets',
        subcategories: ['Tablets', 'Smart Home', 'Wearables', 'Drones', 'VR/AR']
    },
    {
        name: 'Watches',
        icon: Watch,
        color: 'bg-slate-100 text-slate-600',
        href: '/products?category=Watches',
        subcategories: ['Smartwatches', 'Analog', 'Digital', 'Luxury', 'Straps']
    },
]

export default function CategoriesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">All Categories</h1>
            <p className="text-muted-foreground mb-8">Explore our wide range of products by category</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_CATEGORIES.map((category) => (
                    <Link key={category.name} href={category.href} className="group block h-full">
                        <Card className="h-full hover:shadow-md transition-shadow transition-colors group-hover:border-primary/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${category.color} group-hover:scale-110 transition-transform`}>
                                        <category.icon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h2>
                                        <ul className="space-y-1">
                                            {category.subcategories.map((sub) => (
                                                <li key={sub} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                    {sub}
                                                </li>
                                            ))}
                                            <li className="text-sm font-medium text-primary mt-2">
                                                View All {category.name} &rarr;
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
