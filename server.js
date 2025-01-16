const app = require("./app");
const connectDB = require("./db");

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});