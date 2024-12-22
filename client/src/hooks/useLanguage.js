import { useParams } from "react-router-dom";

const useLanguage = () => {
  const { category } = useParams();

  const languageMapping = {
    javascript: "javascript",
    python: "python",
    sql: "sql",
    reactjs: "javascript",
    nodejs: "javascript",
    html: "html",
    css: "css",
    powerbi: "sql",
  };

  return languageMapping[category?.toLowerCase()] || "javascript";
};

export default useLanguage;
