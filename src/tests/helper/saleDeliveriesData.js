// saleDeliveriesData.js

const deliveryCreate = (saleId, addressId = 1) => ({
  sale_id: saleId,
  customer_address_id: addressId,
  estimated_date: '2026-03-10',
  notes: 'Entrega de prueba'
});

const deliveryCreateWithDriver = (saleId, addressId = 1) => ({
  sale_id: saleId,
  customer_address_id: addressId,
  driver_id: 1,
  transport_plate: 'ABC-123',
  estimated_date: '2026-03-10',
  notes: 'Entrega con conductor'
});

const deliveryCreateNoSale = {
  customer_address_id: 1,
  estimated_date: '2026-03-10'
};

const deliveryCreateNoAddress = (saleId) => ({
  sale_id: saleId,
  estimated_date: '2026-03-10'
});

const transitionData = {
  location: 'Almacén central',
  notes: 'Transición de prueba'
};

module.exports = {
  deliveryCreate,
  deliveryCreateWithDriver,
  deliveryCreateNoSale,
  deliveryCreateNoAddress,
  transitionData
};
