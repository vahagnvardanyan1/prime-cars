import { CardSkeleton } from "./CardSkeleton";
import { ListItemSkeleton } from "./ListSkeleton";

type ViewMode = "grid" | "list";

interface GridSkeletonProps {
  viewMode?: ViewMode;
  count?: number;
}

/**
 * Grid/List skeleton for loading states
 * Renders appropriate skeleton based on view mode
 */
export const GridSkeleton = ({ viewMode = "grid", count = 6 }: GridSkeletonProps) => {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  if (viewMode === "list") {
    return (
      <div role="status" aria-label="Loading content" className="flex flex-col gap-4">
        {items.map((i) => (
          <ListItemSkeleton key={i} />
        ))}
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading content" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
};
