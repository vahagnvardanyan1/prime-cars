/**
 * Generic filtering utility functions
 */

/**
 * Performs a case-insensitive search across multiple string fields
 */
export const matchesSearch = ({ 
  searchTerm, 
  fields 
}: { 
  searchTerm: string; 
  fields: (string | undefined | null)[] 
}): boolean => {
  if (!searchTerm) return true;
  
  const searchLower = searchTerm.toLowerCase();
  return fields.some(field => 
    field?.toLowerCase().includes(searchLower)
  );
};

/**
 * Checks if a value matches a filter condition
 */
export const matchesFilter = <T>({ 
  value, 
  filter, 
  allValue = "all" as T 
}: { 
  value: T; 
  filter: T; 
  allValue?: T 
}): boolean => {
  if (filter === allValue) return true;
  return value === filter;
};

/**
 * Checks if a boolean flag matches a filter condition
 */
export const matchesBooleanFilter = ({ 
  value, 
  filter 
}: { 
  value: boolean | undefined; 
  filter: "all" | "yes" | "no" 
}): boolean => {
  if (filter === "all") return true;
  const boolValue = value === true;
  return filter === "yes" ? boolValue : !boolValue;
};

/**
 * Checks if a date falls within a date range
 */
export const matchesDateRange = ({ 
  date, 
  fromDate, 
  toDate 
}: { 
  date: string | undefined; 
  fromDate?: string; 
  toDate?: string 
}): boolean => {
  if (!fromDate && !toDate) return true;
  if (!date) return false;
  
  const dateObj = new Date(date);
  const dateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (fromDate && dateString < fromDate) return false;
  if (toDate && dateString > toDate) return false;
  
  return true;
};
