module.exports = {
  data: [
    // Producto 1 - Sala Esquinera (en 3 sucursales)
    { id: 1, product_id: 1, branch_id: 1, quantity: 5, min_stock: 2, max_stock: 10, location: 'A-01-01' },
    { id: 2, product_id: 1, branch_id: 2, quantity: 3, min_stock: 1, max_stock: 8, location: 'A-01-02' },
    { id: 3, product_id: 1, branch_id: 3, quantity: 2, min_stock: 1, max_stock: 5, location: 'A-01-01' },

    // Producto 2 - Comedor (en 4 sucursales)
    { id: 4, product_id: 2, branch_id: 1, quantity: 8, min_stock: 3, max_stock: 15, location: 'B-01-01' },
    { id: 5, product_id: 2, branch_id: 2, quantity: 4, min_stock: 2, max_stock: 10, location: 'B-01-02' },
    { id: 6, product_id: 2, branch_id: 3, quantity: 3, min_stock: 1, max_stock: 8, location: 'B-01-01' },
    { id: 7, product_id: 2, branch_id: 4, quantity: 2, min_stock: 1, max_stock: 5, location: 'B-01-01' },

    // Producto 3 - Recámara (en 2 sucursales)
    { id: 8, product_id: 3, branch_id: 1, quantity: 4, min_stock: 2, max_stock: 8, location: 'C-01-01' },
    { id: 9, product_id: 3, branch_id: 2, quantity: 2, min_stock: 1, max_stock: 5, location: 'C-01-02' },

    // Producto 4 - Colchón (en 5 sucursales - producto popular)
    { id: 10, product_id: 4, branch_id: 1, quantity: 15, min_stock: 5, max_stock: 25, location: 'D-01-01' },
    { id: 11, product_id: 4, branch_id: 2, quantity: 10, min_stock: 3, max_stock: 20, location: 'D-01-02' },
    { id: 12, product_id: 4, branch_id: 3, quantity: 8, min_stock: 3, max_stock: 15, location: 'D-01-01' },
    { id: 13, product_id: 4, branch_id: 4, quantity: 6, min_stock: 2, max_stock: 12, location: 'D-01-01' },
    { id: 14, product_id: 4, branch_id: 5, quantity: 5, min_stock: 2, max_stock: 10, location: 'D-01-01' },

    // Producto 5 - Refrigerador (en 3 sucursales)
    { id: 15, product_id: 5, branch_id: 1, quantity: 6, min_stock: 2, max_stock: 12, location: 'E-01-01' },
    { id: 16, product_id: 5, branch_id: 2, quantity: 4, min_stock: 2, max_stock: 8, location: 'E-01-02' },
    { id: 17, product_id: 5, branch_id: 3, quantity: 3, min_stock: 1, max_stock: 6, location: 'E-01-01' },

    // Producto 6 - Lavadora (en 3 sucursales)
    { id: 18, product_id: 6, branch_id: 1, quantity: 7, min_stock: 3, max_stock: 14, location: 'E-02-01' },
    { id: 19, product_id: 6, branch_id: 2, quantity: 5, min_stock: 2, max_stock: 10, location: 'E-02-02' },
    { id: 20, product_id: 6, branch_id: 4, quantity: 3, min_stock: 1, max_stock: 6, location: 'E-02-01' },

    // Producto 7 - TV (en 4 sucursales)
    { id: 21, product_id: 7, branch_id: 1, quantity: 12, min_stock: 4, max_stock: 20, location: 'F-01-01' },
    { id: 22, product_id: 7, branch_id: 2, quantity: 8, min_stock: 3, max_stock: 15, location: 'F-01-02' },
    { id: 23, product_id: 7, branch_id: 3, quantity: 5, min_stock: 2, max_stock: 10, location: 'F-01-01' },
    { id: 24, product_id: 7, branch_id: 5, quantity: 4, min_stock: 2, max_stock: 8, location: 'F-01-01' },

    // Producto 8 - Bicicleta (en 2 sucursales)
    { id: 25, product_id: 8, branch_id: 1, quantity: 10, min_stock: 3, max_stock: 18, location: 'G-01-01' },
    { id: 26, product_id: 8, branch_id: 2, quantity: 6, min_stock: 2, max_stock: 12, location: 'G-01-02' },

    // Producto 9 - Ropero (en 3 sucursales)
    { id: 27, product_id: 9, branch_id: 1, quantity: 5, min_stock: 2, max_stock: 10, location: 'H-01-01' },
    { id: 28, product_id: 9, branch_id: 2, quantity: 3, min_stock: 1, max_stock: 6, location: 'H-01-02' },
    { id: 29, product_id: 9, branch_id: 4, quantity: 2, min_stock: 1, max_stock: 5, location: 'H-01-01' },

    // Producto 10 - Litera (en 2 sucursales)
    { id: 30, product_id: 10, branch_id: 1, quantity: 4, min_stock: 2, max_stock: 8, location: 'I-01-01' },
    { id: 31, product_id: 10, branch_id: 2, quantity: 2, min_stock: 1, max_stock: 5, location: 'I-01-02' }
  ]
};
