const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId= require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//TODO: add middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.rkyae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


// TODO:CRUD Operation:
async function run() {
  try {
    await client.connect();
    const bikeCollection = client.db("bikevio").collection("inventory");
    
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = bikeCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

       // TODO: get a user (follow doc find a doc):
       app.get('/inventory/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await bikeCollection.findOne(query);
        res.send(result);
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running My Bikevio Server");
});

app.listen(port, () => {
  console.log("Bikevio-server-side is running :", port);
});
