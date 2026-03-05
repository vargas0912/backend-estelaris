const {
  saleDeliveries, saleDeliveryLogs, sales, customerAddresses, employees, users
} = require('../models/index');
const { sequelize } = require('../models/index');

const deliveryAttributes = [
  'id', 'sale_id', 'customer_address_id', 'status', 'driver_id',
  'transport_plate', 'estimated_date', 'delivered_at', 'notes',
  'created_at', 'updated_at'
];

const logAttributes = ['id', 'delivery_id', 'status', 'location', 'notes', 'created_by', 'created_at'];
const addressAttributes = ['id', 'street', 'neighborhood', 'postal_code'];
const employeeAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];

const deliveryIncludes = [
  { model: customerAddresses, as: 'customerAddress', attributes: addressAttributes },
  { model: employees, as: 'driver', attributes: employeeAttributes },
  {
    model: saleDeliveryLogs,
    as: 'logs',
    attributes: logAttributes,
    include: [{ model: users, as: 'createdByUser', attributes: userAttributes }],
    order: [['created_at', 'ASC']]
  }
];

// Valid transitions: current_status -> [allowed_next_statuses]
const VALID_TRANSITIONS = {
  Preparando: ['Recolectado', 'Devuelto'],
  Recolectado: ['En_Transito', 'Devuelto'],
  En_Transito: ['En_Ruta_Entrega', 'Devuelto'],
  En_Ruta_Entrega: ['Entregado', 'Devuelto']
};

const FINAL_STATUSES = ['Entregado', 'Devuelto'];

const getDelivery = async (id) => {
  return saleDeliveries.findOne({
    attributes: deliveryAttributes,
    where: { id },
    include: deliveryIncludes
  });
};

const getDeliveriesBySale = async (saleId) => {
  return saleDeliveries.findAll({
    attributes: deliveryAttributes,
    where: { sale_id: saleId },
    include: deliveryIncludes,
    order: [['created_at', 'DESC']]
  });
};

const createDelivery = async (body, userId) => {
  const {
    sale_id: saleId,
    customer_address_id: customerAddressId,
    driver_id: driverId,
    transport_plate: transportPlate,
    estimated_date: estimatedDate,
    notes
  } = body;

  const sale = await sales.findByPk(saleId, { attributes: ['id', 'status'] });
  if (!sale) return { error: 'SALE_NOT_FOUND' };
  if (sale.status === 'Cancelado') return { error: 'SALE_IS_CANCELLED' };

  const address = await customerAddresses.findByPk(customerAddressId, { attributes: ['id'] });
  if (!address) return { error: 'ADDRESS_NOT_FOUND' };

  const transaction = await sequelize.transaction();

  try {
    const delivery = await saleDeliveries.create({
      sale_id: saleId,
      customer_address_id: customerAddressId,
      status: 'Preparando',
      driver_id: driverId || null,
      transport_plate: transportPlate || null,
      estimated_date: estimatedDate || null,
      notes: notes || null
    }, { transaction });

    await saleDeliveryLogs.create({
      delivery_id: delivery.id,
      status: 'Preparando',
      notes: 'Entrega creada',
      created_by: userId
    }, { transaction });

    await transaction.commit();
    return getDelivery(delivery.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const transitionDelivery = async (id, targetStatus, body, userId) => {
  const delivery = await saleDeliveries.findByPk(id);
  if (!delivery) return { error: 'NOT_FOUND' };

  if (FINAL_STATUSES.includes(delivery.status)) {
    return { error: 'DELIVERY_ALREADY_FINALIZED' };
  }

  const allowed = VALID_TRANSITIONS[delivery.status] || [];
  if (!allowed.includes(targetStatus)) {
    return { error: `INVALID_TRANSITION_FROM_${delivery.status}_TO_${targetStatus}` };
  }

  const transaction = await sequelize.transaction();

  try {
    const updateData = { status: targetStatus };

    if (body.driver_id !== undefined) updateData.driver_id = body.driver_id;
    if (body.transport_plate !== undefined) updateData.transport_plate = body.transport_plate;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (targetStatus === 'Entregado') {
      updateData.delivered_at = new Date().toISOString().split('T')[0];
    }

    await delivery.update(updateData, { transaction });

    await saleDeliveryLogs.create({
      delivery_id: id,
      status: targetStatus,
      location: body.location || null,
      notes: body.notes || null,
      created_by: userId
    }, { transaction });

    await transaction.commit();
    return getDelivery(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteDelivery = async (id) => {
  const delivery = await saleDeliveries.findByPk(id);
  if (!delivery) return { error: 'NOT_FOUND' };

  if (['Entregado'].includes(delivery.status)) {
    return { error: 'DELIVERY_CANNOT_BE_DELETED' };
  }

  await saleDeliveries.destroy({ where: { id } });
  return { deleted: true };
};

module.exports = {
  getDelivery,
  getDeliveriesBySale,
  createDelivery,
  transitionDelivery,
  deleteDelivery
};
