const { Router } = require('express');
const {
  summary,
  recent,
  trends,
} = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../constants/roles');
const { validate } = require('../middleware/validate');
const {
  summaryQuerySchema,
  recentQuerySchema,
  trendsQuerySchema,
} = require('../validations/dashboard.validation');

const router = Router();

const dashboardRoles = [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN];

router.use(requireAuth);
router.use(authorize(...dashboardRoles));

router.get('/summary', validate(summaryQuerySchema, 'query'), summary);
router.get('/recent', validate(recentQuerySchema, 'query'), recent);
router.get('/trends', validate(trendsQuerySchema, 'query'), trends);

module.exports = router;
