import { BsSearch } from "react-icons/bs";
import styles from "@/styles/style.module.scss";

const Search = () => {
  return (
    <div className="relative">
      <div
        className={`relative w-[260px] h-[40px] m-0 p-0 ${styles.searchInput}`}
      >
        <input
          type="text"
          className="w-full h-full rounded-[6px] px-3 bg-[transparent] text-base text-medium text-default placeholder:text-default focus:border-none visible:border-none focus-visible:outline-none space-5"
          placeholder="Input articles..."
        />
        <BsSearch className="absolute transition-all duration-700 right-5 top-3 text-default hover:scale-125 ease" />
      </div>
    </div>
  );
};

export default Search;
