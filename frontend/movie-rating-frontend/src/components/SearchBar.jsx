import { useState, useEffect } from "react";
import "./SearchBar.css";

// Reusable search input component
// Accepts initial value for pre-filled searches
function SearchBar({
  onSearch,
  placeholder = "Search movies...",
  initialValue = "",
}) {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // Update internal state when initialValue changes (from URL)
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleInputChange = (event) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="search-input"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={clearSearch}
          className="clear-button"
          aria-label="Clear search"
        ></button>
      )}
      <button type="submit" className="search-button">
        🔍 Search
      </button>
    </form>
  );
}

export default SearchBar;
