'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Star, MessageSquare, Reply, ThumbsUp, RefreshCw, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  foodRating: number;
  serviceRating: number;
  ambienceRating: number;
  cleanlinessRating: number;
  overallRating: number;
  comment?: string;
  isPublic: boolean;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  customerId?: { name: string; phone: string };
  orderId?: { orderNumber: string };
}

const StarRating = ({ value, max = 5, size = 'sm' }: { value: number; max?: number; size?: 'sm' | 'lg' }) => {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`${sz} ${i < Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [stats, setStats] = useState({ avg: 0, food: 0, service: 0, ambience: 0, cleanliness: 0, total: 0 });

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/reviews');
      const data: Review[] = res.data.data || [];
      setReviews(data);

      if (data.length > 0) {
        setStats({
          total: data.length,
          avg: parseFloat((data.reduce((s, r) => s + r.overallRating, 0) / data.length).toFixed(1)),
          food: parseFloat((data.reduce((s, r) => s + r.foodRating, 0) / data.length).toFixed(1)),
          service: parseFloat((data.reduce((s, r) => s + r.serviceRating, 0) / data.length).toFixed(1)),
          ambience: parseFloat((data.reduce((s, r) => s + r.ambienceRating, 0) / data.length).toFixed(1)),
          cleanliness: parseFloat((data.reduce((s, r) => s + r.cleanlinessRating, 0) / data.length).toFixed(1)),
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) { toast.error('Reply cannot be empty'); return; }
    setSubmittingReply(true);
    try {
      await axiosInstance.put(`/reviews/${reviewId}/reply`, { reply: replyText });
      toast.success('Reply posted');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getRatingColor = (val: number) =>
    val >= 4 ? 'text-green-600 dark:text-green-400' : val >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400';

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Customer Reviews</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{stats.total} total reviews</p>
        </div>
        <button onClick={fetchReviews} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {/* Rating Summary */}
      {stats.total > 0 && (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Overall Score */}
            <div className="text-center flex-shrink-0">
              <div className="text-6xl font-black text-gray-900 dark:text-white">{stats.avg}</div>
              <StarRating value={stats.avg} size="lg" />
              <p className="text-sm text-gray-500 mt-2">{stats.total} reviews</p>
            </div>
            {/* Category Ratings */}
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { label: 'Food Quality', value: stats.food },
                { label: 'Service', value: stats.service },
                { label: 'Ambience', value: stats.ambience },
                { label: 'Cleanliness', value: stats.cleanliness },
              ].map(cat => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">{cat.label}</span>
                      <span className={`text-xs font-bold ${getRatingColor(cat.value)}`}>{cat.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${(cat.value / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">No reviews yet</p>
            <p className="text-sm mt-2 text-center">Customer reviews from completed orders will appear here</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="card p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(review.customerId?.name ?? 'A').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{review.customerId?.name ?? 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="font-black text-gray-900 dark:text-white">{review.overallRating}</span>
                    <span className="text-gray-400 text-xs">/5</span>
                  </div>
                  {review.orderId && <p className="text-xs text-gray-400 mt-0.5">{review.orderId.orderNumber}</p>}
                </div>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Food', value: review.foodRating },
                  { label: 'Service', value: review.serviceRating },
                  { label: 'Ambience', value: review.ambienceRating },
                  { label: 'Cleanliness', value: review.cleanlinessRating },
                ].map(cat => (
                  <div key={cat.label} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className={`text-lg font-black ${getRatingColor(cat.value)}`}>{cat.value}</p>
                    <p className="text-xs text-gray-500">{cat.label}</p>
                  </div>
                ))}
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl italic">
                  "{review.comment}"
                </p>
              )}

              {/* Existing Reply */}
              {review.reply && (
                <div className="mt-3 pl-4 border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Your Response:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{review.reply}</p>
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === review._id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a professional, helpful reply to this customer…"
                    className="input-field"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="btn-secondary text-xs">Cancel</button>
                    <button onClick={() => submitReply(review._id)} disabled={submittingReply} className="btn-primary text-xs">
                      {submittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Post Reply'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setReplyingTo(review._id); setReplyText(review.reply ?? ''); }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <Reply className="w-3.5 h-3.5" />
                  {review.reply ? 'Edit Reply' : 'Reply to review'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
