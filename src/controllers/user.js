const { municipalities } = require('../models/index');

module.exports = {
  async all (req, res) {
    const data = await municipalities.findAll({
      attributes: ['id', 'name'],
      include: {
        association: 'estado',
        attributes: ['name']
      }
    });

    res.json(data);
  }
};
