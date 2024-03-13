import { create } from "zustand";

type TProductStore = {
  selectedId: number;
};

type TSetPoductId = (productId: number) => void;
// we can store selected id in useState and do HOC but would be comfortable to store it in a state management

const useProductStore = create<
  { product: Partial<TProductStore> } & { setProductId: TSetPoductId }
>(
  (set) =>
    ({
      product: {
        selectedId: undefined,
      },
      setProductId: (productId: number) => {
        set((prev) => ({
          ...prev,
          product: {
            selectedId: productId,
          },
        }));
      },
    }) as const,
);

export default useProductStore;
