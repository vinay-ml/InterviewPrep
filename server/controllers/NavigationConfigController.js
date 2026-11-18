const NavigationSection = require('../models/NavigationConfigModel');
const Questions = require('../models/QuestionsModel');

const normalizePath = (path, label) => {
  const value =
    path ||
    `/${String(label || '')
      .trim()
      .toLowerCase()}`;
  return value.startsWith('/') ? value : `/${value}`;
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getInsertIndex = (order, itemCount) => {
  const numericOrder = Number(order);

  if (!Number.isFinite(numericOrder)) {
    return itemCount;
  }

  return Math.min(Math.max(Math.trunc(numericOrder) - 1, 0), itemCount);
};

const normalizeSectionOrders = async () => {
  const sections = await NavigationSection.find().sort({ order: 1, category: 1 });

  for (const [index, section] of sections.entries()) {
    section.order = index;
    await section.save();
  }
};

const normalizeTopicOrders = (topics) => {
  topics.sort((a, b) => a.order - b.order);
  topics.forEach((topic, index) => {
    topic.order = index;
  });
};

const reorderSection = async (sectionId, order) => {
  const sections = await NavigationSection.find().sort({ order: 1, category: 1 });
  const currentIndex = sections.findIndex((section) => section._id.toString() === sectionId);

  if (currentIndex === -1) {
    return null;
  }

  const [targetSection] = sections.splice(currentIndex, 1);
  const insertIndex = getInsertIndex(order, sections.length);
  sections.splice(insertIndex, 0, targetSection);

  for (const [index, section] of sections.entries()) {
    section.order = index;
    await section.save();
  }

  return targetSection;
};

const reorderTopic = (topics, topicId, order) => {
  normalizeTopicOrders(topics);
  const currentIndex = topics.findIndex((topic) => topic._id.toString() === topicId);

  if (currentIndex === -1) {
    return null;
  }

  const [targetTopic] = topics.splice(currentIndex, 1);
  const insertIndex = getInsertIndex(order, topics.length);
  topics.splice(insertIndex, 0, targetTopic);
  topics.forEach((topic, index) => {
    topic.order = index;
  });

  return targetTopic;
};

const sortSections = (sections) =>
  sections
    .map((section) => ({
      ...section.toObject(),
      topics: [...section.topics].sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.order - b.order);

const topicCategoryName = (topic) => (topic.path || '').replace(/^\/+|\/+$/g, '').trim();

const getQuestionCountsByCategory = async () => {
  const rows = await Questions.aggregate([
    { $match: { category: { $type: 'string', $ne: '' } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id, row.count]));
};

const getTopicQuestionCount = async (topic, countsByCategory) => {
  const categoryName = topicCategoryName(topic);
  if (!categoryName) return 0;
  if (countsByCategory) return countsByCategory.get(categoryName) || 0;
  return Questions.countDocuments({ category: categoryName });
};

const getSectionQuestionCount = async (section) => {
  let count = 0;
  for (const topic of section.topics) {
    count += await getTopicQuestionCount(topic);
  }
  return count;
};

exports.getNavigationConfig = async (_req, res) => {
  try {
    const sections = await NavigationSection.find({ enabled: true });
    const sorted = sortSections(sections);
    const countsByCategory = await getQuestionCountsByCategory();
    const data = [];

    for (const section of sorted) {
      const topicsData = [];
      let sectionCount = 0;

      for (const topic of section.topics) {
        if (topic.enabled) {
          const count = await getTopicQuestionCount(topic, countsByCategory);
          sectionCount += count;
          topicsData.push({
            _id: topic._id,
            label: topic.label,
            path: topic.path,
            language: topic.language || 'javascript',
            order: topic.order,
            questionCount: count,
          });
        }
      }

      data.push({
        _id: section._id,
        category: section.category,
        order: section.order,
        questionCount: sectionCount,
        topics: topicsData,
      });
    }

    res.status(200).json({ message: 'Navigation config retrieved successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching navigation config', error: error.message });
  }
};

exports.createNavigationSection = async (req, res) => {
  try {
    const { category, order } = req.body;

    if (!category || !String(category).trim()) {
      return res.status(400).json({ message: 'Section category is required' });
    }

    const trimmedCategory = String(category).trim();
    const existing = await NavigationSection.findOne({
      category: new RegExp(`^${escapeRegExp(trimmedCategory)}$`, 'i'),
    });

    if (existing) {
      return res.status(409).json({ message: 'Section already exists', data: existing });
    }

    const sections = await NavigationSection.find().sort({ order: 1, category: 1 });
    const insertIndex = getInsertIndex(order, sections.length);

    for (const section of sections) {
      if (section.order >= insertIndex) {
        section.order += 1;
        await section.save();
      }
    }

    const section = await NavigationSection.create({
      category: trimmedCategory,
      order: insertIndex,
      topics: [],
    });

    await normalizeSectionOrders();

    res.status(201).json({ message: 'Section created successfully', data: section });
  } catch (error) {
    res.status(500).json({ message: 'Error creating section', error: error.message });
  }
};

exports.updateNavigationSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { order } = req.body;

    const section = await reorderSection(sectionId, order);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json({ message: 'Section position updated successfully', data: section });
  } catch (error) {
    res.status(500).json({ message: 'Error updating section', error: error.message });
  }
};

exports.createNavigationTopic = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { label, path, language = 'javascript', order } = req.body;

    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: 'Topic label is required' });
    }

    const section = await NavigationSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const nextPath = normalizePath(path, label);
    const topicExists = section.topics.some(
      (topic) => topic.path.trim().toLowerCase() === nextPath.trim().toLowerCase()
    );

    if (topicExists) {
      return res.status(409).json({ message: 'Topic already exists in this section' });
    }

    const insertIndex = getInsertIndex(order, section.topics.length);

    section.topics.forEach((topic) => {
      if (topic.order >= insertIndex) {
        topic.order += 1;
      }
    });

    section.topics.push({
      label: String(label).trim(),
      path: nextPath,
      language: String(language || 'javascript').trim(),
      order: insertIndex,
    });

    normalizeTopicOrders(section.topics);
    await section.save();
    res.status(201).json({ message: 'Topic created successfully', data: section });
  } catch (error) {
    res.status(500).json({ message: 'Error creating topic', error: error.message });
  }
};

exports.updateNavigationTopic = async (req, res) => {
  try {
    const { sectionId, topicId } = req.params;
    const { order } = req.body;

    const section = await NavigationSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const topic = reorderTopic(section.topics, topicId, order);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    await section.save();
    res.status(200).json({ message: 'Topic position updated successfully', data: section });
  } catch (error) {
    res.status(500).json({ message: 'Error updating topic', error: error.message });
  }
};

exports.deleteNavigationSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await NavigationSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const count = await getSectionQuestionCount(section);
    if (count > 0) {
      return res.status(400).json({ message: 'Cannot delete section with existing questions' });
    }

    await NavigationSection.findByIdAndDelete(sectionId);
    await normalizeSectionOrders();

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error: error.message });
  }
};

exports.deleteNavigationTopic = async (req, res) => {
  try {
    const { sectionId, topicId } = req.params;

    const section = await NavigationSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const topic = section.topics.find((t) => t._id.toString() === topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const count = await getTopicQuestionCount(topic);
    if (count > 0) {
      return res.status(400).json({ message: 'Cannot delete topic with existing questions' });
    }

    section.topics = section.topics.filter((t) => t._id.toString() !== topicId);
    normalizeTopicOrders(section.topics);
    await section.save();

    res.status(200).json({ message: 'Topic deleted successfully', data: section });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting topic', error: error.message });
  }
};
