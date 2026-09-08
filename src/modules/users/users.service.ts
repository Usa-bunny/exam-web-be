const bcrypt = require("bcrypt");
const { User } = require("../../../models");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class UsersService {
  async create(data: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
  }) {
    const existingUser = await User.findOne({
      where: { email: data.email },
    });

    if (existingUser) throw new Error("Email Already Used");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userData } = newUser.toJSON();

    return userData;
  }

  async getAll(query: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    role?: "admin" | "teacher" | "student";
  }) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";
    const role = query.role || null;

    const whereCondition = {
      ...buildSearchCondition(search, ["name", "email"]),
    };

    if (role) {
      whereCondition.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ["password"] },
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getById(id: number | string) {
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  }

  async update(
    id: number | string,
    data: {
      name: string;
      email: string;
      password: string;
      role: "admin" | "teacher" | "student";
    },
  ) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("User not found");

    const updateData = { ...data };

    if (data.email && data.email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email: data.email },
      });
      if (existingEmail) throw new Error("Email Already Used");
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await user.update(updateData);

    const { password, ...userData } = user.toJSON();

    return userData;
  }

  async delete(id: number | string) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("User not found");

    await user.destroy();

    return true;
  }
}

module.exports = new UsersService();
