import { Outlet, Route, Routes } from "react-router-dom";
import { Categories, CategoryDetail } from "./components/categories";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import styles from "./App.module.css";
import CategoriesCards from "./components/categories/CategoriesCards";
import { useEffect } from "react";
import { useService, useServicePagination } from "./hooks/useService";
import useCategoryStore from "./stores/category";
import ProductDetail from "./components/product/ProductDetail";

const App = () => {
  const setCategories = useCategoryStore((store) => store.setCategories);
  const categories = useCategoryStore((store) => store.categories);
  // in our case is not necessary to store selected category in zustand as we can get it from url
  const [data, loading, error, getData] = useServicePagination(
    "/categories",
    "get",
    5,
    0,
  );

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!!data) {
      setCategories(data);
    }
  }, [data]);

  return (
    <div className={styles.main}>
      <Header />
      <Routes>
        {/* Product detail (i.e. with all offers */}
        <Route
          path="/product/:productId/:categoryId"
          element={<ProductDetail />}
        />
        {/* routes with the left categories navbar */}
        <Route
          element={
            <div className={styles.twoColumn}>
              <Categories categories={categories} />
              <Outlet />
            </div>
          }
        >
          <Route path="/category/:categoryId" element={<CategoryDetail />} />
          <Route
            path="/"
            element={<CategoriesCards categories={categories} />}
          />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
