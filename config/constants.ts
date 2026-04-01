// Computed constants
const IS_DEV = process.env.ENVIRONMENT === 'development';

// Core layer constants
const NEURAFLOW_CORE_LAYER_REPO = 'github:ANSNeuraFlow/neuraflow-core-layer';
const NEURAFLOW_CORE_LAYER_DEV_PATH = process.env.CORE_LAYER_PATH ?? '../neuraflow-core-layer';
const NEURAFLOW_CORE_LAYER_PATH = IS_DEV ? NEURAFLOW_CORE_LAYER_DEV_PATH : NEURAFLOW_CORE_LAYER_REPO;

// Other constants
const COOKIE_MAX_AGE_DAYS = 30;

export { COOKIE_MAX_AGE_DAYS, IS_DEV, NEURAFLOW_CORE_LAYER_PATH };
