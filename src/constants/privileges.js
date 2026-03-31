const PRIVILEGES = Object.freeze({
  VIEW: 'view_privilege',
  VIEW_MODULE: 'view_module',
  CREATE: 'create_privilege',
  UPDATE: 'update_privilege',
  DELETE: 'delete_privilege',
  CREATE_USER: 'create_user_privilege',
  VIEW_USER: 'view_user_privilege',
  DELETE_USER: 'delete_user_privilege'
});

const USERS = Object.freeze({
  REGISTER: 'register_user',
  CREATE_SUPERADMIN: 'create_superadmin',
  VIEW: 'view_user',
  VIEW_ALL: 'view_users',
  UPDATE: 'update_user',
  DELETE: 'delete_user'
});

const USER_VALIDATORS = Object.freeze({
  ID_NOT_EXISTS: 'ID_NOT_EXISTS',
  ID_IS_EMPTY: 'ID_IS_EMPTY',
  ID_MUST_BE_NUMERIC: 'ID_MUST_BE_NUMERIC',
  CODE_NOT_EXISTS: 'CODE_NOT_EXISTS',
  CODE_IS_EMPTY: 'CODE_IS_EMPTY',
  USER_ID_NOT_EXISTS: 'USER_ID_NOT_EXISTS',
  USER_ID_IS_EMPTY: 'USER_ID_IS_EMPTY',
  PRIVILEGE_ID_NOT_EXISTS: 'PRIVILEGE_ID_NOT_EXISTS',
  PRIVILEGE_ID_IS_EMPTY: 'PRIVILEGE_ID_IS_EMPTY',
  MODULE_NOT_EXISTS: 'MODULE_NOT_EXISTS',
  MODULE_IS_EMPTY: 'MODULE_IS_EMPTY',
  NAME_NOT_EXISTS: 'NAME_NOT_EXISTS',
  NAME_IS_EMPTY: 'NAME_IS_EMPTY'
});

const FIELDS = {
  ID: 'id',
  USERID: 'user_id',
  CODENAME: 'codename',
  PID: 'pid',
  PRIVILEGE_ID: 'privilege_id'

};

const LOYALTY = Object.freeze({
  VIEW_LOYALTY_CONFIG: 'view_loyalty_config',
  CREATE_LOYALTY_CONFIG: 'create_loyalty_config',
  EDIT_LOYALTY_CONFIG: 'edit_loyalty_config',
  VIEW_LOYALTY_POINTS: 'view_loyalty_points',
  ADJUST_LOYALTY_POINTS: 'adjust_loyalty_points'
});

module.exports = { PRIVILEGES, USERS, USER_VALIDATORS, FIELDS, LOYALTY };
