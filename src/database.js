const { MongoClient } = require("mongodb");

const URI =
  "mongodb+srv://tariqueanwar386:5Ini9RZyLtsP14Wy@clusternodejs.plnnj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNodeJS";

const client = new MongoClient(URI);
const dbName = "myFirstDB";

async function main() {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("nodeJS");

  //Insert
//   const data = {
//     firstName: "Shahrukh",
//     lastName: "khan",
//     description: "1st entryvia code",
//     date: "29 January 2025",
//   };

//   const insertResult = await collection.insertMany([data]);
//   console.log("Inserted documents ==>", insertResult);

  //Read
  const findResult = await collection.find({}).toArray();
  console.log("Found document ==>", findResult);

  return "done";
}
main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
