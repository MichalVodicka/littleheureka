import { Suspense, useEffect } from "react";
import { useServicePagination } from "../../hooks/useService";
import { useParams, useSearchParams } from "react-router-dom";
import Pagination from "../product/Pagination";

import styles from "./CategoryDetail.module.css";
import Product from "../product/Product";
const PAGESIZE = 5;

const Category: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNo = Number(searchParams.get("pageNo")) || 0;
  const [data, loading, error, fetchInit, fetchPrev, fetchNext, total] =
    useServicePagination("/products", "get", PAGESIZE, pageNo * PAGESIZE);

  const { categoryId } = useParams();
  console.log(error);
  const handlePrev = () => setSearchParams({ pageNo: String(pageNo - 1) });
  const handleNext = () => setSearchParams({ pageNo: String(pageNo + 1) });
  const handleSetPage = (pageNo: number | string) =>
    setSearchParams({ pageNo: String(pageNo) });
  useEffect(() => {
    categoryId && fetchInit({ categoryId: categoryId });
  }, [categoryId, pageNo]);
  useEffect(() => {
    console.log("loadign");
  }, [categoryId, pageNo]);

  return !loading ? (
    <div className={styles.categoryDetail}>
      {error && <div>Error: {error.toString()}</div>}

      {data?.map((product) => <Product key={product.id} {...product} />)}

      {total && (
        <Pagination
          currentPageNo={pageNo}
          total={total}
          pageSize={PAGESIZE}
          handlePrev={handlePrev}
          handleNext={handleNext}
          setPage={handleSetPage}
        />
      )}
    </div>
  ) : (
    <div> Loading ... </div>
  );
};

export default Category;
