const getPaginationParams = (data) => {
  const page = Number(data.page ?? 1);
  const limit = Number(data.limit ?? 20);
  return { page, limit, offset: (page - 1) * limit };
};

const buildPaginationResponse = (key, rows, total, page, limit) => ({
  [key]: rows,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
});

module.exports = { getPaginationParams, buildPaginationResponse };
