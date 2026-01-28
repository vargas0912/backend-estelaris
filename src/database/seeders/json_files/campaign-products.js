module.exports = {
  data: [
    {
      id: 1,
      campaign_id: 1,
      product_id: 1,
      discount_type: 'percentage',
      discount_value: 25.00,
      max_quantity: 100,
      sold_quantity: 0
    },
    {
      id: 2,
      campaign_id: 1,
      product_id: 2,
      discount_type: 'percentage',
      discount_value: 30.00,
      max_quantity: 50,
      sold_quantity: 0
    },
    {
      id: 3,
      campaign_id: 1,
      product_id: 3,
      discount_type: 'fixed_price',
      discount_value: 50.00,
      max_quantity: 25,
      sold_quantity: 0
    },
    {
      id: 4,
      campaign_id: 2,
      product_id: 1,
      discount_type: 'percentage',
      discount_value: 35.00,
      max_quantity: 75,
      sold_quantity: 0
    },
    {
      id: 5,
      campaign_id: 2,
      product_id: 2,
      discount_type: 'percentage',
      discount_value: 20.00,
      max_quantity: null,
      sold_quantity: 0
    }
  ]
};
