import { Link } from "react-router-dom";
import styles from "./Product.module.css";
import { ReactEventHandler, useEffect, useMemo } from "react";
import { useServicePagination } from "../../hooks/useService";

type ProductProps = {
  id: number;
  title: string;
  categoryId: number;
};

const Product: React.FC<ProductProps> = ({ id, title, categoryId }) => {
  // get description and price range
  const [offers, loading, error, fetchInit] = useServicePagination(
    "/offers",
    "get",
    0,
    0,
  );

  useEffect(() => {
    id && fetchInit({ productId: id.toString() });
  }, []);

  const priceRange: [number, number] = useMemo(() => {
    const range: [number, number] = [0, 0];
    offers?.forEach((currentPrice) => {
      // another posibile solution create an ode
      range[0] =
        range[0] > 0 && range[0] <= currentPrice.price
          ? range[0]
          : currentPrice.price;
      range[1] = range[1] >= currentPrice.price ? range[1] : currentPrice.price;
    });
    return range;
  }, [offers?.length]);

  const image = useMemo(() => {
    if (offers && offers?.length > 0) {
      for (let i = 0; i < offers.length; i++) {
        if (offers[i]?.imgUrl) {
          return offers[i]?.imgUrl;
        }
      }
      return "/noimage.svg";
    }
  }, [!!offers?.length]);

  const description = useMemo(() => {
    return offers?.[0]?.description || "Popisek v priprave";
  }, [!!offers?.length]);

  // img url is NOT missing but the image returns 404
  const handleImageError: ReactEventHandler<HTMLImageElement> = (
    image: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    (image.target as HTMLImageElement).src = "/noimage.svg";
  };

  return (
    <div className={styles.product}>
      {error && <div>{error.toString()}</div>}
      <div className={styles.img}>
        {image && <img onError={handleImageError} src={image} />}{" "}
      </div>
      <div>
        <div key={id} className={styles.title}>
          <Link to={`/product/${id}/${categoryId}`}>
            <h2>{title}</h2>
          </Link>
        </div>
        {!loading && offers?.length ? (
          <div className={styles.description}>{description}</div>
        ) : (
          <div>Loading ... </div>
        )}
      </div>
      {!loading ? (
        <div className={styles.pricing}>
          <span>
            {~~priceRange[0] +
              (priceRange[0] !== priceRange[1]
                ? ` - ${~~priceRange[1]}`
                : "")}{" "}
            Kc
          </span>
          <Link
            to={`/product/${id}/${categoryId}`}
            className={styles.compareprices}
          >
            <span>Porovnat ceny</span>
          </Link>
        </div>
      ) : (
        <div>Loading ... </div>
      )}
    </div>
  );
};

export default Product;
