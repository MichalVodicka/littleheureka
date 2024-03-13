import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <h1>
        <Link to="/">Little Heureka</Link>{" "}
      </h1>
    </div>
  );
};

export default Header;
