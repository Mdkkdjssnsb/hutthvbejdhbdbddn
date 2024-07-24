const LiaMongo = require('lia-mongo');

const liaMongo = new LiaMongo({
  uri: "mongodb+srv://aryankumarg:iuYj*f5m8YsAFCF@goatmart.c64ig7m.mongodb.net/?retryWrites=true&w=majority&appName=GoatMart",
  collection: "myCollection",
  isOwnHost: false,
});

const connectToDatabase = async () => {
  try {
    await liaMongo.start();
    console.log("Connected to MongoDB");
    return liaMongo;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports = { connectToDatabase };
