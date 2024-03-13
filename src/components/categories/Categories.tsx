import { Link, useParams } from "react-router-dom";
import styles from "./Categories.module.css";
type TCategory = {
  id: number;
  title: string;
};

type CategoriesProps = {
  categories: TCategory[];
};
const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  const { categoryId } = useParams();
  return (
    <ul className={styles.categories}>
      {categories.map((category) => (
        <li
          key={category.id}
          className={[
            styles.item,
            categoryId === category.id.toString() && styles.selected,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Link
            className={[
              styles.item,
              categoryId === category.id.toString() && styles.selected,
            ]
              .filter(Boolean)
              .join(" ")}
            to={"/category/" + category.id}
          >
            {category.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Categories;
