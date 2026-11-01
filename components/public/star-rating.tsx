import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  label?: string;
};

export function StarRating({ value, interactive = false, onChange, label }: StarRatingProps) {
  const rating = Math.min(5, Math.max(0, Number.isFinite(value) ? value : 0));
  const accessibleLabel = label ?? `${rating.toLocaleString("id-ID", { maximumFractionDigits: 1 })} dari 5 bintang`;

  return (
    <span className="star-rating" role={interactive ? "radiogroup" : "img"} aria-label={accessibleLabel}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, rating - index)) * 100;
        const star = (
          <span className="star-rating-glyph" aria-hidden="true">
            <Star className="star-rating-empty" />
            <span className="star-rating-fill" style={{ width: `${fill}%` }}>
              <Star />
            </span>
          </span>
        );

        if (!interactive || !onChange) return <span className="star-rating-item" key={index}>{star}</span>;

        return (
          <button
            className="star-rating-item star-rating-choice"
            type="button"
            role="radio"
            aria-checked={rating === index + 1}
            aria-label={`${index + 1} dari 5 bintang`}
            key={index}
            onClick={() => onChange(index + 1)}
          >
            {star}
          </button>
        );
      })}
    </span>
  );
}
