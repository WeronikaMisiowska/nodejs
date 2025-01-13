const mongoose = require("mongoose");

const uri = "mongodb://misiowskaweronika:Zaq12wsX@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/db-contacts?ssl=true&replicaSet=atlas-9y35km-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(uri)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });
