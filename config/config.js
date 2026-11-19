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
  schema: 'exam_web',
  searchPath: 'exam_web', 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    prependSearchPath: true 
  },
  define: {
    schema: 'exam_web' 
  }
};

module.exports = {
  development: useSupabase ? supabaseConfig : localConfig,
  production: supabaseConfig
};