import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

type UseLocationSearchParams = {
  availableCities: string[];
  isOpen: boolean;
  search: string;
  onSelect: (city: string) => void;
  onClose: () => void;
};

type UseLocationSearchResult = {
  filteredCities: string[];
  highlightedIndex: number;
  setHighlightedIndex: (i: number) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  highlightedRowRef: RefObject<HTMLDivElement>;
  handleSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function useLocationSearch({
  availableCities,
  isOpen,
  search,
  onSelect,
  onClose,
}: UseLocationSearchParams): UseLocationSearchResult {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const highlightedRowRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;

  // Auto-focus search input when the dropdown opens (delay so Radix's own focus
  // management runs first).
  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isOpen]);

  const filteredCities = useMemo(
    () => availableCities.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [availableCities, search],
  );

  // Reset highlight when search or list changes.
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search, availableCities]);

  // Scroll the highlighted row into view when it moves via keyboard.
  useEffect(() => {
    if (!isOpen) return;
    highlightedRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, Math.max(filteredCities.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const city = filteredCities[highlightedIndex];
        if (city) {
          e.preventDefault();
          onSelect(city);
        }
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }
      e.stopPropagation();
    },
    [filteredCities, highlightedIndex, onSelect, onClose],
  );

  return {
    filteredCities,
    highlightedIndex,
    setHighlightedIndex,
    searchInputRef,
    highlightedRowRef,
    handleSearchKeyDown,
  };
}
