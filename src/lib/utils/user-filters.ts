/**
 * User filtering utility functions
 */

import type { AdminUser } from "@/lib/admin/types";

import { matchesSearch, matchesFilter } from "./filters";

export type UserFiltersState = {
  search: string;
  country: string;
};

/**
 * Filter users based on provided filter criteria
 */
export const filterUsers = ({ users, filters }: { users: AdminUser[]; filters: UserFiltersState }): AdminUser[] => {
  return users.filter((user) => {
    // Search filter
    if (filters.search) {
      const matches = matchesSearch({ 
        searchTerm: filters.search, 
        fields: [
          user.firstName,
          user.lastName,
          user.username,
          user.email,
          user.phone,
          user.passport,
        ]
      });
      if (!matches) return false;
    }

    // Country filter
    if (!matchesFilter({ value: user.country, filter: filters.country, allValue: "all" })) {
      return false;
    }

    return true;
  });
};

/**
 * Default user filters
 */
export const defaultUserFilters: UserFiltersState = {
  search: "",
  country: "all",
};
