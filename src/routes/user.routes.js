const { Router } = require('express');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../constants/roles');
const { validate } = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} = require('../validations/user.validation');

const router = Router();

router.use(requireAuth);
router.use(authorize(ROLES.ADMIN));

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', validate(idParamSchema, 'params'), getUser);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  updateUser
);
router.delete('/:id', validate(idParamSchema, 'params'), deleteUser);

module.exports = router;
