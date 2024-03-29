import styles from "./ProductDetail.module.css";
import { useService, useServicePagination } from "../../hooks/useService";
import React, {
  ReactEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import Offer from "../offer/Offer";

const VISIBLE_OFFERS_DEFULT = 3;

const ProductDetail: React.FC<{}> = () => {
  // get description and price range
  const [showAllDescription, setShowAllDescription] = useState<boolean>(false);
  const [showAllOffers, setShowAllOffers] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState<boolean>(false);

  const { productId, categoryId } = useParams();

  const [category, cl, ce, fetchCategory] = useService("/category", "get");
  const [product, pl, pe, fetchProduct] = useService("/product", "get");
  const [offers, ol, oe, fetchInit, prv, next, total] = useServicePagination(
    "/offers",
    "get",
    0,
    0,
  );

  const descriptionContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    productId && fetchInit({ productId: productId.toString() });
  }, []);

  useEffect(() => {
    categoryId && fetchCategory({ id: categoryId.toString() });
  }, []);

  useEffect(() => {
    productId && fetchProduct({ id: productId.toString() });
  }, []);

  // naive chech if the text if overflowing its container
  // "watching" resizing browser window would be better solution
  useEffect(
    () =>
      descriptionContainer.current &&
      descriptionContainer.current?.scrollHeight >
        descriptionContainer.current?.clientHeight
        ? setIsDescriptionOverflowing(true)
        : setIsDescriptionOverflowing(false),
    [ol, pl, cl],
  );

  const images: string[] = useMemo(() => {
    if (!offers) {
      return [];
    }

    if (offers?.length) {
      return [...new Set(offers.map((offer) => offer.imgUrl)).values()].filter(
        Boolean,
      );
    }
    // fallback image if there is no image
    return ["/noimage.svg"];
  }, [!!offers?.length]);

  // img url is NOT missing but the image returns 404
  const handleImageError: ReactEventHandler<HTMLImageElement> = (
    image: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    (image.target as HTMLImageElement).src = "/noimage.svg";
  };

  const handleShowMoreDescription = () => {
    if (descriptionContainer.current) {
      descriptionContainer.current.style.maxHeight = "unset";
      setShowAllDescription(true);
    }
  };

  // handle related button
  const handleShowMoreOffers = () => setShowAllOffers(true);

  // calculate how many offers should be visible. e.g. 5 or all
  const countOffersToShow = useMemo(() => {
    return showAllOffers ? undefined : VISIBLE_OFFERS_DEFULT;
  }, [showAllOffers]);

  // extract description from very first offer related to the product
  const description = useMemo(() => {
    return offers?.[0]?.description || "Popisek v priprave";
  }, [!!offers?.length]);

  return !ol && !cl && !pl ? (
    <div className={styles.productDetail}>
      {oe && <div>Error: {oe.toString()}</div>}
      {ce && <div>Error: {ce.toString()}</div>}
      {pe && <div>Error: {pe.toString()}</div>}

      <div className={styles.header}>
        {
          <div className={[styles.img, styles.imgLarge].join(" ")}>
            {images.length > 0 && (
              <img
                onError={handleImageError}
                src={images[selectedImage] || "/noimage.svg"}
              />
            )}
          </div>
        }

        {/* Images on left side */}
        <div className={styles.imgSmallWrapper}>
          {images.map((image, idx) => (
            <div
              key={image}
              className={[
                styles.img,
                styles.imgSmall,
                selectedImage === idx && styles.selectedImage,
                selectedImage !== idx && styles.selectableImage,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectedImage !== idx && setSelectedImage(idx)}
            >
              <img src={image} onError={handleImageError} />
            </div>
          ))}
        </div>
      </div>

      {/* description and title. Right top */}
      <div className={styles.metadata}>
        <div className={styles.title}>
          <h2>{product?.title}</h2>
        </div>
        <span>
          {category?.title ? (
            <Link to={`/category/${categoryId}`}>{category.title}</Link>
          ) : undefined}{" "}
          {">>"} {product?.title}
        </span>
        <div ref={descriptionContainer} className={styles.description}>
          {description}
        </div>
        {isDescriptionOverflowing && !showAllDescription && (
          <div
            className={styles.showMoreLink}
            onClick={handleShowMoreDescription}
          >
            <a>Zobrazit vice</a>
          </div>
        )}
      </div>

      <div className={styles.hr}>
        <hr />
      </div>

      <div className={styles.offers}>
        {offers
          ?.slice(0, countOffersToShow)
          .map((offer) => <Offer key={offer.id} {...offer} />)}

        {/* show "show more" button only when there is reason for it */}
        {!showAllOffers &&
          countOffersToShow &&
          countOffersToShow > 0 &&
          total &&
          total > countOffersToShow && (
            <div className={styles.showMoreLink} onClick={handleShowMoreOffers}>
              <a>Zobrazit vice</a>
            </div>
          )}
      </div>
    </div>
  ) : (
    <div>Loading ...</div>
  );
};

export default ProductDetail;
