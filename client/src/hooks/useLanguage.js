import { useParams } from 'react-router-dom';
import { useGetNavigationConfigQuery } from '../redux/api/navigationApi';

const getTopicPath = (topic) => topic.path || `/${topic.label.trim().toLowerCase()}`;

const getLanguageByCategory = (category, sections = []) => {
  const normalizedCategory = category?.trim().toLowerCase();

  const matchingTopic = sections
    .flatMap((section) => section.topics || [])
    .find((topic) => {
      const normalizedPath = getTopicPath(topic)
        .replace(/^\/+|\/+$/g, '')
        .trim()
        .toLowerCase();
      const normalizedLabel = topic.label.trim().toLowerCase();

      return normalizedPath === normalizedCategory || normalizedLabel === normalizedCategory;
    });

  return matchingTopic?.language || 'javascript';
};

const useLanguage = () => {
  const { category } = useParams();
  const { data } = useGetNavigationConfigQuery();

  return getLanguageByCategory(category, data?.data || []);
};

export default useLanguage;
