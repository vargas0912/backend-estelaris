module.exports = {
  data: [
    {
      id: 1,
      name: 'Público General',
      description: 'Precio de venta al público en general',
      discount_percent: 0,
      is_active: true,
      priority: 1
    },
    {
      id: 2,
      name: 'Mayoreo',
      description: 'Precio para compras al mayoreo (10+ piezas)',
      discount_percent: 10,
      is_active: true,
      priority: 2
    },
    {
      id: 3,
      name: 'Distribuidor',
      description: 'Precio especial para distribuidores autorizados',
      discount_percent: 20,
      is_active: true,
      priority: 3
    },
    {
      id: 4,
      name: 'Empleados',
      description: 'Precio especial para empleados de la empresa',
      discount_percent: 15,
      is_active: true,
      priority: 4
    },
    {
      id: 5,
      name: 'Promoción',
      description: 'Precios de promoción temporal',
      discount_percent: 25,
      is_active: false,
      priority: 5
    }
  ]
};
