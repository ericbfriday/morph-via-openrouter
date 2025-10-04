import { config } from 'dotenv';

const path = process.env.MORPH_ENV_PATH;

config(path ? { path } : undefined);
