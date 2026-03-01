export const getAuthInputClass = (hasError) =>
  `w-full rounded-2xl px-4 py-3 text-sm outline-none transition border bg-zinc-950/40 text-white placeholder:text-white/30 ${
    hasError
      ? "border-red-400/40 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/15"
      : "border-white/10 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
  }`;

export const mapAuthSubmitError = (
  error,
  {
    fallback,
    customMatchers = [],
    networkMessage = "Network error. Please try again.",
    timeoutMessage = "Request took too long. Please try again.",
  },
) => {
  const message = String(error?.message || "");

  for (const matcher of customMatchers) {
    if (matcher.predicate(message)) {
      return typeof matcher.message === "function"
        ? matcher.message(message)
        : matcher.message;
    }
  }

  if (message.includes("Failed to fetch")) {
    return networkMessage;
  }

  if (message === "timeout") {
    return timeoutMessage;
  }

  return fallback;
};
