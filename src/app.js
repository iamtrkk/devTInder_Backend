const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send("I m Trk");
});

app.post("/user", (req, res) => {
  res.send("Data posted");
});

app.delete("/user", (req, res) => {
  res.send("user deleted");
});

app.use("/test", (req, res) => {
  res.send("Helo");
});

//Should be always at botttom otherwise it will be returned for all endpoints
//Also app.use matches all the HTTP methods so it will be returned not matter if method is get or not
app.use("/", (req, res) => {
  res.send("This is home");
});

app.listen(5678, () => {
  console.log("Server chaalu hai port 5678");
});
