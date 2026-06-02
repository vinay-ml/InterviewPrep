const express = require('express');
const {
  createNavigationSection,
  createNavigationTopic,
  getNavigationConfig,
  updateNavigationSection,
  updateNavigationTopic,
  deleteNavigationSection,
  deleteNavigationTopic,
} = require('../controllers/NavigationConfigController');
const { requireAdminAccess } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

router.get('/', getNavigationConfig);
router.post('/sections', requireAdminAccess, createNavigationSection);
router.put('/sections/:sectionId', requireAdminAccess, updateNavigationSection);
router.delete('/sections/:sectionId', requireAdminAccess, deleteNavigationSection);
router.post('/sections/:sectionId/topics', requireAdminAccess, createNavigationTopic);
router.put('/sections/:sectionId/topics/:topicId', requireAdminAccess, updateNavigationTopic);
router.delete('/sections/:sectionId/topics/:topicId', requireAdminAccess, deleteNavigationTopic);

module.exports = router;
