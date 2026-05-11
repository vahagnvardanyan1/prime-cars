"use client";

import { Table } from "@radix-ui/themes";

type TextCellProps = {
  value?: string | null;
  cellClassName?: string;
  valueClassName?: string;
  fallback?: string;
};

export const TextCell = ({
  value,
  cellClassName = "px-3 py-2 min-w-[110px] border-r border-gray-100 dark:border-white/5 max-w-[140px]",
  valueClassName = "text-sm text-gray-900 dark:text-white truncate",
  fallback = "-",
}: TextCellProps) => (
  <Table.Cell className={cellClassName}>
    <div className={valueClassName} title={value || undefined}>
      {value || fallback}
    </div>
  </Table.Cell>
);
