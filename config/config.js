require("dotenv").config();

const useSupabase = process.env.USE_SUPABASE === 'true';

const localConfig = {
  username: "root",
  password: "", 
  database: "exam-web-development", 
  host: "127.0.0.1",
  dialect: "mysql"
};

const supabaseConfig = {
  use_env_variable: 'SUPABASE_URL', 
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development: useSupabase ? supabaseConfig : localConfig,
  production: supabaseConfig
};