const express = require("express");

const app = express();

app.get("/user", (req, res,next) => {
  // res.send("I m Trk");
  console.log('middleware 1')
  next()
},
// basically a middleware we can add as many callbacks we need and can jump using next()
// middleware are basically functions that are called in series of events for a 
// we can also separate the callback function and call it here like w do in danskeGPT bff express router
(req, res) => {
  console.log('middleware 2')
  res.send("I m Trk");
},
);

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
// can be use to handle error as a corner case in case we miss try catch in any middleware
// we need to add err in parameter (err,req,res,next) and handle it
// as it will act as a middleware if response not send by /user it will go next
// automatically to match the next router and here / will be matched
app.use("/", (req, res) => {
  res.send("This is home");
});

app.listen(5678, () => {
  console.log("Server chaalu hai port 5678");
});
