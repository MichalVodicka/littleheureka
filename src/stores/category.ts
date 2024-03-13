import { create } from "zustand";
type TCategory = {
  id: number;
  title: string;
};

type TCategoryStore = {
  categories: TCategory[];
  selectedCategory: TCategory | null;
  setSelectedCategory: (category: TCategory) => void;
  setCategories: (categories: TCategory[] | undefined) => void;
};

// we can store selected id in useState and do HOC but would be comfortable to store it in a state management
const useCategoryStore = create<TCategoryStore>(
  (set) =>
    ({
      selectedCategory: null,
      categories: [],
      setSelectedId: (categoryId: number) => {
        set((prev) => ({
          ...prev,
          category: {
            selectedId: categoryId,
          },
        }));
      },
      setSelectedCategory: (category: TCategory) => {
        set((prev) => ({
          ...prev,
          category,
        }));
      },
      setCategories: (categories) => {
        set((prev) => ({
          ...prev,
          categories: categories ?? [],
        }));
      },
    }) as const,
);

export default useCategoryStore;
