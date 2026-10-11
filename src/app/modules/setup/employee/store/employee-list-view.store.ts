import { create } from "zustand";
import type { EmployeeListQuery } from "../models/api/request/employee-list-query.model";

export const EMPLOYEE_PAGE_SIZE = 20;

export const INITIAL_EMPLOYEE_LIST_QUERY: EmployeeListQuery = {
  page: 1,
  limit: EMPLOYEE_PAGE_SIZE,
};

// What the Setup > Employee list is showing: its page, sort, search and column filters. Kept here,
// not in the page's own state, because opening an employee to edit unmounts the list -- with local
// state, coming back after Save landed on the unfiltered first page instead of the search the user
// was working from. Held in memory only, so a full reload still starts clean.
interface EmployeeListViewStore {
  query: EmployeeListQuery;
  // The text in the search box, which can differ from query.keyword while it's being typed.
  searchText: string;
  setQuery: (
    next:
      EmployeeListQuery | ((current: EmployeeListQuery) => EmployeeListQuery),
  ) => void;
  setSearchText: (text: string) => void;
}

export const useEmployeeListViewStore = create<EmployeeListViewStore>(
  (set) => ({
    query: INITIAL_EMPLOYEE_LIST_QUERY,
    searchText: "",
    setQuery: (next) =>
      set((state) => ({
        query: typeof next === "function" ? next(state.query) : next,
      })),
    setSearchText: (searchText) => set({ searchText }),
  }),
);
