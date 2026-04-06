const { Router } = require('express');
const {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../constants/roles');
const { validate } = require('../middleware/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema,
  idParamSchema,
} = require('../validations/record.validation');

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  authorize(ROLES.ANALYST, ROLES.ADMIN),
  validate(listRecordsQuerySchema, 'query'),
  listRecords
);
router.get(
  '/:id',
  authorize(ROLES.ANALYST, ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  getRecord
);
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createRecordSchema),
  createRecord
);
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateRecordSchema),
  updateRecord
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  deleteRecord
);

module.exports = router;
