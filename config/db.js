const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    // avoid deprecation warning and control strictQuery behavior
    mongoose.set('strictQuery', false);

    const mongoUri = process.env.MONGO_URL;
    if (!mongoUri || typeof mongoUri !== 'string') {
      throw new Error('MONGO_URL environment variable is not set or is invalid');
    }

    await mongoose.connect(mongoUri);
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb Server Issue ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
