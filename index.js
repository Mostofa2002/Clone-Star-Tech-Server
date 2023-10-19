const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.0jbjnlh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const productCollection = client.db("productDB").collection("product");
    const addCartCollection = client.db("productDB").collection("addCart");
    // specific data
    app.get("/product/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const cursor = await productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/product", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Details to add cart
    app.get("/productS/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { description: 1, price: 1, photo: 1, name: 1 },
      };
      const result = await productCollection.findOne(query, options);
      res.send(result);
    });
    // form to database
    app.post("/product", async (req, res) => {
      const addProduct = req.body;
      const result = await productCollection.insertOne(addProduct);
      res.send(result);
    });

    // Add Cart
    app.get("/addCarts", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await addCartCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/addCarts", async (req, res) => {
      const Cart = req.body;
      const result = await addCartCollection.insertOne(Cart);
      res.send(result);
    });
    // delete from my cart
    app.delete("/addCarts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addCartCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is listening on port");
});
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
