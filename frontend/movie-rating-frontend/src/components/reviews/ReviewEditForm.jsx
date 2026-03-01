import { useState } from "react";
import StarRating from "../StarRating";

function ReviewEditForm({ review, onSave, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (rating === 0) return;
    setIsSaving(true);

    try {
      await onSave({ rating, comment });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 p-4 rounded-xl border border-blue-500/30">
      <div className="mb-4">
        <label className="text-xs font-bold text-white/50 uppercase mb-1 block">
          Rating
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <div className="mb-4">
        <label className="text-xs font-bold text-white/50 uppercase mb-1 block">
          Your Review
        </label>
        <textarea
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ReviewEditForm;
