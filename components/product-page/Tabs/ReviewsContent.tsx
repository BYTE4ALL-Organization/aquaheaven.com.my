"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReviewCard from "@/components/common/ReviewCard";
import { Review } from "@/types/review.types";

type ReviewsContentProps = {
  productId?: string;
  productSlug?: string;
  reviews?: Review[];
  /** Only true when user is logged in and has purchased this product. */
  canReview?: boolean;
};

const ReviewsContent = ({
  productId,
  productSlug,
  reviews = [],
  canReview = false,
}: ReviewsContentProps) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSlug || !canReview) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/shop/products/${encodeURIComponent(productSlug)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error || "Failed to submit review.");
        return;
      }
      if (data?.data) {
        const r = data.data;
        setLocalReviews((prev) => [
          {
            id: r.id,
            user: r.user?.name ?? "You",
            content: (r.comment || r.title || "").trim() || "No comment.",
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
          ...prev,
        ]);
      }
      setShowForm(false);
      setComment("");
      setRating(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between flex-col sm:flex-row mb-5 sm:mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h3 className="text-xl sm:text-2xl font-bold text-black mr-2">
            All Reviews
          </h3>
          <span className="text-sm sm:text-base text-black/60">({localReviews.length})</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Select defaultValue="latest">
            <SelectTrigger className="min-w-[120px] font-medium text-xs sm:text-base px-4 py-3 sm:px-5 sm:py-4 text-black bg-[#F0F0F0] border-none rounded-full h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="most-relevant">Most Relevant</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          {productId && (
            <Button
              type="button"
              className="sm:min-w-[166px] px-4 py-3 sm:px-5 sm:py-4 rounded-full font-medium text-xs sm:text-base h-12"
              variant={canReview ? "default" : "secondary"}
              disabled={!canReview}
              title={
                canReview
                  ? "Write a review"
                  : "Sign in and purchase this product to leave a review"
              }
              onClick={() => canReview && setShowForm((v) => !v)}
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {showForm && canReview && productSlug && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-6 p-4 sm:p-6 border border-black/10 rounded-lg bg-black/[0.02]"
        >
          <h4 className="text-lg font-semibold text-black mb-3">Write a Review</h4>
          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-black/80">Rating</label>
            <Select
              value={String(rating)}
              onValueChange={(v) => setRating(Number(v))}
            >
              <SelectTrigger className="w-[120px] bg-white border border-black/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} star{n !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-black/80">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 text-sm border border-black/20 rounded-md bg-white"
              placeholder="Share your experience with this product..."
            />
          </div>
          {submitError && (
            <p className="text-red-600 text-sm mb-3">{submitError}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setSubmitError(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!canReview && (
        <p className="text-sm text-black/60 mb-4">
          Sign in and purchase this product to leave a review.
        </p>
      )}

      {localReviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 sm:mb-9">
          {localReviews.map((review) => (
            <ReviewCard key={review.id} data={review} isAction isDate />
          ))}
        </div>
      ) : (
        <p className="text-black/60 py-8">
          No reviews yet.
          {canReview ? " Be the first to review this product." : " Purchase and sign in to leave a review."}
        </p>
      )}
    </section>
  );
};

export default ReviewsContent;
