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
    "genai with js": "javascript",
    "genai with py": "python",
    sequelize: "javascript",
    mongodb: "javascript",
    rabbitMQ: "javascript",
    Redis: "javascript",
    kafka: "javascript",
    "System design": "javascript",
  };

  return languageMapping[category?.toLowerCase()] || "javascript";
};

export default useLanguage;
