const { Op } = require("sequelize");

const getPaginationParams = (
  query: { page: string; limit: string },
  defaultLimit = 10,
) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || defaultLimit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const formatPagination = (count: any, limit: any, page: any) => {
  const totalPage = Math.ceil(count / limit) || 0;

  return {
    total_data: count,
    total_page: totalPage,
    total_pages: totalPage,
    current_page: page,
    limit: limit,
  };
};

const buildSearchCondition = (search: any, fields: any[] = []) => {
  if (!search || fields.length === 0) return {};

  return {
    [Op.or]: fields.map((field) => ({
      [field]: {
        [Op.like]: `%${search}%`,
      },
    })),
  };
};

module.exports = {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
};
