'use client'

import { useEffect, useState } from 'react'
import { Star, ThumbsUp, User } from 'lucide-react'
import { reviewApi, Review, ReviewStats } from '@/lib/api/reviews'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

interface ProductReviewsProps {
    productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const { isAuthenticated } = useAuthStore()
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reviewsData, statsData] = await Promise.all([
                    reviewApi.getProductReviews(productId),
                    reviewApi.getReviewStats(productId),
                ])
                setReviews(reviewsData.data)
                setStats(statsData)
            } catch (error) {
                console.error('Failed to fetch reviews', error)
                // Don't toast error on 404 (no reviews yet)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [productId])

    const handleHelpful = async (reviewId: string) => {
        if (!isAuthenticated) return toast.error('Please login to vote')
        try {
            await reviewApi.markHelpful(reviewId)
            toast.success('Marked as helpful')
            // Optimistic update
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
        } catch (error) {
            toast.error('Failed to mark helpful')
        }
    }

    if (loading) {
        return <ReviewsSkeleton />
    }

    // Empty State
    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center bg-muted/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to review this product!</p>
                <Button disabled={!isAuthenticated}>Write a Review</Button>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Stats Header */}
            {stats && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-end justify-center md:justify-start gap-2">
                            <span className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</span>
                            <span className="text-2xl text-muted-foreground mb-1">/ 5</span>
                        </div>
                        <div className="flex justify-center md:justify-start">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`}
                                />
                            ))}
                        </div>
                        <p className="text-muted-foreground">{stats.totalReviews} total reviews</p>
                    </div>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.ratingDistribution[String(rating) as keyof typeof stats.ratingDistribution] || 0
                            const percentage = (count / stats.totalReviews) * 100 || 0
                            return (
                                <div key={rating} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-12 text-sm">
                                        {rating} <Star className="h-3 w-3" />
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                    <div className="w-12 text-sm text-right text-muted-foreground">{count}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <Separator />

            {/* Review List */}
            <div className="space-y-8">
                {reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={review.userAvatar} />
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{review.userName}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {review.verifiedPurchase && (
                                <div className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded">
                                    Verified Purchase
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`}
                                    />
                                ))}
                            </div>
                            {review.title && <h4 className="font-bold">{review.title}</h4>}
                            <p className="text-muted-foreground">{review.content}</p>
                        </div>

                        {review.images && review.images.length > 0 && (
                            <div className="flex gap-2">
                                {review.images.map((img, i) => (
                                    <img key={i} src={img} alt="Review" className="w-20 h-20 object-cover rounded border" />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => handleHelpful(review.id)} className="text-muted-foreground">
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Helpful ({review.helpfulCount})
                            </Button>
                        </div>
                        <Separator />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ReviewsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-16 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
