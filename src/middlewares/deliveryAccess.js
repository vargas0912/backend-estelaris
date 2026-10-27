const { saleDeliveries, employees } = require('../models/index');
const { getOneUserPrivilege } = require('../services/user-privileges');
const { handleForbidden } = require('../utils/handleErorr');
const { ROLE } = require('../constants/roles');
const { SALE_DELIVERY, DRIVER } = require('../constants/modules');

/**
 * Allows transition if:
 *   - superadmin, OR
 *   - has update_sale_delivery privilege, OR
 *   - has update_driver_delivery privilege AND delivery.driver_id === employee.id (linked to req.user)
 */
const checkDeliveryTransitionAccess = async (req, res, next) => {
  try {
    const { user } = req;

    if (user.role === ROLE.SUPERADMIN) return next();

    if (user.role !== ROLE.USER) {
      handleForbidden(res, 'ERROR_NOT_PERMISSION');
      return;
    }

    const hasAdminPrivilege = await getOneUserPrivilege(user.id, SALE_DELIVERY.UPDATE);
    if (hasAdminPrivilege) return next();

    const hasDriverPrivilege = await getOneUserPrivilege(user.id, DRIVER.UPDATE_DELIVERY);
    if (hasDriverPrivilege) {
      const employee = await employees.findOne({
        where: { user_id: user.id },
        attributes: ['id']
      });

      if (employee) {
        const delivery = await saleDeliveries.findByPk(req.params.id, {
          attributes: ['id', 'driver_id']
        });

        if (delivery && delivery.driver_id === employee.id) {
          return next();
        }
      }
    }

    handleForbidden(res, 'NOT_PRIVILEGE');
  } catch (error) {
    handleForbidden(res, 'ERROR_NOT_PERMISSION');
  }
};

module.exports = { checkDeliveryTransitionAccess };
