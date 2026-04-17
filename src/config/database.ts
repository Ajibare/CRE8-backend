import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://ajibarebabajide1_db_user:<db_password>@creative.2xkavxl.mongodb.net/?appName=Creative',
    options: {
      // Connection options removed as they're deprecated in newer versions
    }
  }
};
