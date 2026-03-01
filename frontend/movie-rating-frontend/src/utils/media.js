export const buildPlaceholderPoster = (title) =>
  `https://placehold.co/400x600?text=${encodeURIComponent(title || "Title").replace(/%20/g, "+")}`;
