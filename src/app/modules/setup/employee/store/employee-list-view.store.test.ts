import { beforeEach, describe, expect, it } from "vitest";
import {
  INITIAL_EMPLOYEE_LIST_QUERY,
  useEmployeeListViewStore,
} from "./employee-list-view.store";

describe("useEmployeeListViewStore", () => {
  beforeEach(() => {
    useEmployeeListViewStore.setState({
      query: INITIAL_EMPLOYEE_LIST_QUERY,
      searchText: "",
    });
  });

  it("starts on the plain first page", () => {
    const { query, searchText } = useEmployeeListViewStore.getState();

    expect(query).toEqual({ page: 1, limit: 20 });
    expect(searchText).toBe("");
  });

  it("keeps the search and filters after the list page unmounts and returns", () => {
    const { setQuery, setSearchText } = useEmployeeListViewStore.getState();
    setSearchText("melgar");
    setQuery((q) => ({ ...q, keyword: "melgar", page: 1 }));

    // The page remounting reads the store again, as opening an employee and coming back does.
    const { query, searchText } = useEmployeeListViewStore.getState();

    expect(query.keyword).toBe("melgar");
    expect(searchText).toBe("melgar");
  });

  it("accepts a whole query as well as an updater", () => {
    useEmployeeListViewStore
      .getState()
      .setQuery({ page: 3, limit: 20, clientIds: ["c1"] });

    expect(useEmployeeListViewStore.getState().query).toMatchObject({
      page: 3,
      clientIds: ["c1"],
    });
  });
});
