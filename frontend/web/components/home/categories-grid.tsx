'use client';

import { useCategories } from '@/hooks/use-products';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Icon and color mapping for categories from backend
const categoryStyles: Record<string, { icon: string; color: string }> = {
  'elektronik': { icon: '💻', color: 'from-blue-500 to-indigo-600' },
  'fashion': { icon: '👕', color: 'from-pink-500 to-rose-600' },
  'rumah-tangga': { icon: '🏠', color: 'from-amber-500 to-orange-600' },
  // Default fallbacks
  'beauty': { icon: '💄', color: 'from-purple-500 to-pink-600' },
  'sports': { icon: '⚽', color: 'from-emerald-500 to-teal-600' },
  'toys': { icon: '🧸', color: 'from-yellow-500 to-amber-600' },
};

export function CategoriesGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!categories?.length) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Belanja per Kategori</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat: Category) => {
          const style = categoryStyles[cat.slug] || { icon: '📦', color: 'from-gray-500 to-gray-600' };
          return (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="group">
              <div className="relative bg-card border border-border p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all h-full aspect-square md:aspect-auto md:h-40 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                  {style.icon}
                </span>
                <span className="font-semibold text-center relative z-10">{cat.name}</span>
                {cat.description && (
                  <span className="text-xs text-muted-foreground text-center">{cat.description}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
