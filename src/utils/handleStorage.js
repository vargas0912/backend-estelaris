const path = require('path');

const multer = require('multer');
/**
 *
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ruta local de almacenamiento
    // eslint-disable-next-line n/no-path-concat
    const pathStorage = path.join(__dirname, '/../../storage/'); // `${__dirname}/../../storage/`;

    // Callback function
    cb(null, pathStorage);
  },
  filename: function (req, file, cb) {
    // Get extension file
    const ext = file.originalname.split('.').pop();

    // Build filename eg. 'file-1648579804062.jpg'
    const fileName = `file-${Date.now()}.${ext}`;

    cb(null, fileName);
  }
});

// Middleware
const uploadMiddleware = multer({ storage });

module.exports = uploadMiddleware;
