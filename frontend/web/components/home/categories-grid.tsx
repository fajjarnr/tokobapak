'use client';

import { useCategories } from '@/hooks/use-products';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

// Static fallbacks if API is empty initially (as categories might be unseeded)
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: '💻', color: 'from-blue-500 to-indigo-600' },
  { id: '2', name: 'Fashion', slug: 'fashion', icon: '👕', color: 'from-pink-500 to-rose-600' },
  { id: '3', name: 'Home', slug: 'home', icon: '🏠', color: 'from-amber-500 to-orange-600' },
  { id: '4', name: 'Beauty', slug: 'beauty', icon: '💄', color: 'from-purple-500 to-pink-600' },
  { id: '5', name: 'Sports', slug: 'sports', icon: '⚽', color: 'from-emerald-500 to-teal-600' },
  { id: '6', name: 'Toys', slug: 'toys', icon: '🧸', color: 'from-yellow-500 to-amber-600' },
];

export function CategoriesGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Merge API categories with fallback for demo visuals if API return is simple
  const displayCategories = categories?.length ? categories : FALLBACK_CATEGORIES;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Belanja per Kategori</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayCategories.map((cat: Category) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
            <div className="relative bg-card border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all h-full aspect-square md:aspect-auto md:h-40 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color || 'from-gray-100 to-gray-200'} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                {cat.icon || '📦'}
              </span>
              <span className="font-semibold text-center relative z-10">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
