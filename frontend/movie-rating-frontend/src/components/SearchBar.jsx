import { useEffect, useState } from "react";

/**
 * Controlled search input with a submit button and a clear shortcut.
 *
 * `initialValue` lets the parent pre-populate the field (e.g. from URL params)
 * and syncs it whenever the parent value changes — the effect re-runs only when
 * `initialValue` itself changes, not on every user keystroke.
 *
 * `onSearch` is called with the trimmed query string when the form is submitted
 * or when the clear button is clicked (with an empty string).
 */
function SearchBar({ onSearch, placeholder = "Search...", initialValue = "" }) {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // Keep the controlled input in sync when the parent changes initialValue
  // (e.g. navigating from one search page to another with a different URL query).
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors px-3 py-2">
        <span className="text-white/45 text-sm">⌕</span>

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
          type="text"
        />

        {/* Clear button — only shown when there is text to clear */}
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              onSearch(""); // notify parent so results reset immediately
            }}
            className="text-xs text-white/55 hover:text-white/85 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}

        <button
          type="submit"
          className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white"
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
