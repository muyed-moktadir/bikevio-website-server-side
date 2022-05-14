const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//TODO: add middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    console.dir("decoded email", decoded);
    req.decoded = decoded;
    next();
  });
}

// TODO:mongodb
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


    // TODO:Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      // console.dir(user);
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });


    // TODO:get All Bike
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = bikeCollection.find(query);
      const bikes = await cursor.toArray();
      res.send(bikes);
    });


    // TODO: get a bike:
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.findOne(query);
      res.send(result);
    });


    //TODO: delate a bike
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.deleteOne(query);
      res.send(result);
    });



    //  TODO:Update a quantity:
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedQuantity.newQuantity,
        },
      };
      const result = await bikeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });



    // TODO: Add a new bike
    app.post("/inventory", async (req, res) => {
      const newBike = req.body;
      console.log("adding a new user", newBike);
      const result = await bikeCollection.insertOne(newBike);
      res.send(result);
    });



    // TODO:get All newBike ..  verifyJWT,
    app.get("/inventory", async (req, res) => {
      const decodedEmail = req.decoded.email;
      console.log("decoded email", decodedEmail);
      const authHeader = req.headers.authorization;
      console.log(authHeader);
      const email = req.query.email;
      console.dir(email);
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = bikeCollection.filter(query);
        const bikes = await cursor.toArray();
        res.send(bikes);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });
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
