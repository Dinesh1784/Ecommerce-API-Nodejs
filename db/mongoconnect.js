const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`CONNECTED TO DATABASE ${connection.connections[0].name}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDb;
