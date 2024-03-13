import { TCategories } from "./types";
import styles from "./CategoriesCards.module.css";
import CategoryCard from "./CategoryCard";

const CategoriesCards: React.FC<TCategories> = ({ categories }) => {
  return (
    <div className={styles.categoriesCards}>
      {categories.map((category) => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
};

export default CategoriesCards;
