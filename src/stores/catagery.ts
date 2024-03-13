import { create } from "zustand";

type TCategoryStore = {
  selectedId: number;
};

type TSetSelectedCategoryId = (categoryId: number) => void;
// we can store selected id in useState and do HOC but would be comfortable to store it in a state management

const useCategoryStore = create<
  { category: Partial<TCategoryStore> } & {
    setSelectedId: TSetSelectedCategoryId;
  }
>(
  (set) =>
    ({
      categories: {},
      category: {
        selectedId: undefined,
      },
      setSelectedId: (categoryId: number) => {
        set((prev) => ({
          ...prev,
          category: {
            selectedId: categoryId,
          },
        }));
      },
    }) as const,
);

export default useCategoryStore;
