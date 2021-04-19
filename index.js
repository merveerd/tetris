const express = require("express");

const app = express();
const port = 5500;

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`PM2 Project is now live @ localhost:${port}`);
});
