const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const contactsRouter = require("./routes/api/contacts");
app.use("/api/contacts", contactsRouter);


connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});