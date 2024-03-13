import { useEffect } from "react";
import { TCategory } from "./types.ts";
import { useServicePagination } from "../../hooks/useService";
import styles from "./CategoryCard.module.css";
import { Link } from "react-router-dom";
const CategoryCard: React.FC<TCategory> = ({ title, id }) => {
  const [data, error, loading, fetchInit, fetchPrev, fetchNext] =
    useServicePagination("/products", "get", 1, 0);
  const [offer, oe, ol, fetchOffer] = useServicePagination(
    "/offers",
    "get",
    1,
    0,
  );
  useEffect(() => {
    id && fetchInit({ categoryId: id.toString() });
  }, [id]);

  const productId = data?.[0]?.id;

  useEffect(() => {
    const id = data?.[0]?.id;
    id && fetchOffer({ productId: id.toString() });
  }, [productId]);

  const imgUrl = offer?.[0]?.imgUrl;
  return (
    <Link className={styles.linkWrapper} to={`/category/${id}`}>
      <div className={styles.categoryCard}>
        <div className={styles.img}>
          {imgUrl && <img src={imgUrl} className={styles.img} />}
        </div>
        {title}
      </div>
    </Link>
  );
};
export default CategoryCard;
