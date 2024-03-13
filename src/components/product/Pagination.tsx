import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPageNo: number;
  total: number;
  pageSize: number;
  handleNext: () => void;
  handlePrev: () => void;
  setPage: (id: string) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPageNo,
  total,
  pageSize,
  handleNext,
  handlePrev,
  setPage,
}) => {
  const pagesCount = Math.ceil(total / pageSize);

  // do not show a pagination when is only one page
  if (pagesCount <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      {currentPageNo > 0 ? (
        <div className={styles.link} onClick={handlePrev}>
          {" "}
          prev{" "}
        </div>
      ) : null}

      {Array(pagesCount)
        .fill(1)
        .map((_, idx) => (
          <div
            key={idx}
            className={currentPageNo !== idx ? styles.link : undefined}
            onClick={() => currentPageNo !== idx && setPage(String(idx))}
          >
            {idx + 1}
          </div>
        ))}

      {currentPageNo < pagesCount - 1 ? (
        <div className={styles.link} onClick={handleNext}>
          {" "}
          next{" "}
        </div>
      ) : null}
    </div>
  );
};
export default Pagination;
