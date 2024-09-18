const MUNICIPALITY = Object.freeze({
  VIEW: 'view_municipality',
  VIEW_ID: 'view_municipality',
  VIEW_STATE_ID: 'view_municipalities_state'
});

const MUNICIPALITY_VALIDATORS = Object.freeze({
  ID_NOT_EXISTS: 'ID_NOT_EXISTS',
  ID_IS_EMPTY: 'ID_IS_EMPTY',
  NAME_NOT_EXISTS: 'NAME_NOT_EXISTS',
  NAME_IS_EMPTY: 'NAME_IS_EMPTY',
  STATE_NOT_EXISTS: 'STATE_NOT_EXISTS',
  STATE_IS_EMPTY: 'STATE_IS_EMPTY'
});

module.exports = { MUNICIPALITY, MUNICIPALITY_VALIDATORS };
