import { useEffect, useState } from "react";

function SearchBar({ onSearch, placeholder = "Search...", initialValue = "" }) {
  const [searchQuery, setSearchQuery] = useState(initialValue);

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

        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              onSearch("");
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
