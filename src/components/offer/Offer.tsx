import { Link } from "react-router-dom";
import styles from "./Offer.module.css";

type OfferProps = {
  title: string;
  price: number;
  url: string;
};

const Offer: React.FC<OfferProps> = ({ title, url, price }) => {
  return (
    <div className={styles.offer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.buy}>
        <Link to={url}>Koupit</Link>
      </div>
      <div className={styles.price}>{price} Kc</div>
    </div>
  );
};

export default Offer;
