import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  EMAIL: /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

/**
 * User validation rules
 */
export const UserValidators = {
  email: (): ValidationChain =>
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),

  username: (): ValidationChain =>
    body('username')
      .matches(ValidationPatterns.USERNAME)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),

  password: (): ValidationChain =>
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(ValidationPatterns.PASSWORD)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  confirmPassword: (): ValidationChain =>
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),

  firstName: (): ValidationChain =>
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: (): ValidationChain =>
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  role: (): ValidationChain =>
    body('role')
      .optional()
      .isIn(['admin', 'user', 'analyst', 'viewer'])
      .withMessage('Role must be one of: admin, user, analyst, viewer'),

  id: (): ValidationChain =>
    param('id')
      .matches(ValidationPatterns.UUID)
      .withMessage('Invalid user ID format'),
};

/**
 * Authentication validation rules
 */
export const AuthValidators = {
  login: (): ValidationChain[] => [
    body('email')
      .if(body('username').not().exists())
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('username')
      .if(body('email').not().exists())
      .matches(ValidationPatterns.USERNAME)
      .withMessage('Invalid username format'),
    
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean'),
  ],

  register: (): ValidationChain[] => [
    UserValidators.email(),
    UserValidators.username(),
    UserValidators.password(),
    UserValidators.confirmPassword(),
    UserValidators.firstName(),
    UserValidators.lastName(),
    
    body('organizationName')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Organization name must be between 2 and 255 characters'),
    
    body('inviteToken')
      .optional()
      .isLength({ min: 16, max: 128 })
      .withMessage('Invalid invite token format'),
  ],

  refreshToken: (): ValidationChain[] => [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Invalid refresh token format'),
  ],

  forgotPassword: (): ValidationChain[] => [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
  ],

  resetPassword: (): ValidationChain[] => [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 16, max: 128 })
      .withMessage('Invalid reset token format'),
    
    UserValidators.password(),
    UserValidators.confirmPassword(),
  ],

  verifyEmail: (): ValidationChain[] => [
    param('token')
      .notEmpty()
      .withMessage('Verification token is required')
      .isLength({ min: 16, max: 128 })
      .withMessage('Invalid verification token format'),
  ],

  changePassword: (): ValidationChain[] => [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    UserValidators.password(),
    UserValidators.confirmPassword(),
  ],
};

/**
 * Organization validation rules
 */
export const OrganizationValidators = {
  name: (): ValidationChain =>
    body('name')
      .isLength({ min: 2, max: 255 })
      .withMessage('Organization name must be between 2 and 255 characters')
      .matches(/^[a-zA-Z0-9\s&.-]+$/)
      .withMessage('Organization name contains invalid characters'),

  slug: (): ValidationChain =>
    body('slug')
      .matches(ValidationPatterns.SLUG)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
      .isLength({ min: 3, max: 50 })
      .withMessage('Slug must be between 3 and 50 characters'),

  domain: (): ValidationChain =>
    body('domain')
      .optional()
      .isFQDN()
      .withMessage('Invalid domain format'),

  subscriptionTier: (): ValidationChain =>
    body('subscriptionTier')
      .optional()
      .isIn(['basic', 'professional', 'enterprise'])
      .withMessage('Subscription tier must be one of: basic, professional, enterprise'),

  id: (): ValidationChain =>
    param('id')
      .matches(ValidationPatterns.UUID)
      .withMessage('Invalid organization ID format'),
};

/**
 * Model/File validation rules
 */
export const ModelValidators = {
  filename: (): ValidationChain =>
    body('filename')
      .isLength({ min: 1, max: 500 })
      .withMessage('Filename must be between 1 and 500 characters')
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage('Filename contains invalid characters'),

  modelType: (): ValidationChain =>
    body('modelType')
      .optional()
      .isIn(['tensorflow', 'pytorch', 'onnx', 'huggingface', 'scikit-learn', 'other'])
      .withMessage('Invalid model type'),

  framework: (): ValidationChain =>
    body('framework')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Framework name must be between 1 and 100 characters'),

  description: (): ValidationChain =>
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),

  tags: (): ValidationChain =>
    body('tags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Tags must be an array with maximum 20 items')
      .custom((tags: string[]) => {
        if (tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
          throw new Error('Each tag must be a string with maximum 50 characters');
        }
        return true;
      }),

  id: (): ValidationChain =>
    param('id')
      .matches(ValidationPatterns.UUID)
      .withMessage('Invalid model ID format'),
};

/**
 * Query parameter validators
 */
export const QueryValidators = {
  pagination: (): ValidationChain[] => [
    query('page')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Page must be a positive integer between 1 and 10000'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
  ],

  sorting: (): ValidationChain[] => [
    query('sortBy')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Sort field must be between 1 and 50 characters')
      .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .withMessage('Sort field contains invalid characters'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ASC', 'DESC'])
      .withMessage('Sort order must be asc or desc'),
  ],

  search: (): ValidationChain =>
    query('search')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Search term must be between 1 and 255 characters')
      .trim()
      .escape(),

  filter: (): ValidationChain =>
    query('filter')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Filter value must be between 1 and 100 characters'),
};

/**
 * API Key validation rules
 */
export const ApiKeyValidators = {
  name: (): ValidationChain =>
    body('name')
      .isLength({ min: 1, max: 255 })
      .withMessage('API key name must be between 1 and 255 characters')
      .matches(/^[a-zA-Z0-9\s._-]+$/)
      .withMessage('API key name contains invalid characters'),

  permissions: (): ValidationChain =>
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array')
      .custom((permissions: string[]) => {
        const validPermissions = [
          'models:read', 'models:write', 'models:delete',
          'scans:read', 'scans:write', 'alerts:read', 'alerts:write',
          'users:read', 'users:write', 'organizations:read'
        ];
        
        if (permissions.some((perm: string) => !validPermissions.includes(perm))) {
          throw new Error('Invalid permission specified');
        }
        return true;
      }),

  rateLimit: (): ValidationChain =>
    body('rateLimitPerHour')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Rate limit must be between 1 and 10000 requests per hour'),

  expiresAt: (): ValidationChain =>
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Expiration date must be in ISO 8601 format')
      .custom((value: string) => {
        const expirationDate = new Date(value);
        const now = new Date();
        if (expirationDate <= now) {
          throw new Error('Expiration date must be in the future');
        }
        return true;
      }),
};

/**
 * MFA validation rules
 */
export const MfaValidators = {
  totpCode: (): ValidationChain =>
    body('code')
      .matches(/^\d{6}$/)
      .withMessage('TOTP code must be exactly 6 digits'),

  backupCode: (): ValidationChain =>
    body('backupCode')
      .matches(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)
      .withMessage('Invalid backup code format'),

  verifySetup: (): ValidationChain[] => [
    body('setupToken')
      .notEmpty()
      .withMessage('Setup token is required')
      .isLength({ min: 16, max: 128 })
      .withMessage('Invalid setup token format'),
  ],

  completeLogin: (): ValidationChain[] => [
    body('userId')
      .matches(ValidationPatterns.UUID)
      .withMessage('Invalid user ID format'),
    
    body('code')
      .optional()
      .matches(/^\d{6}$/)
      .withMessage('TOTP code must be exactly 6 digits'),
    
    body('backupCode')
      .optional()
      .matches(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)
      .withMessage('Invalid backup code format'),
    
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean'),
  ],
};