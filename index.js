const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@sakinkhan.slpidbs.mongodb.net/?appName=SakinKhan`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("homeNestDB");
    const propertiesCollection = db.collection("properties");

    // GET all properties or filter by userEmail
    app.get("/properties", async (req, res) => {
      try {
        const { userEmail } = req.query;
        const query = userEmail ? { userEmail } : {};

        // Sort by postedDate in descending order (newest first)
        const result = await propertiesCollection
          .find(query)
          .sort({ postedDate: -1 })
          .toArray();

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch properties" });
      }
    });

    // GET a single property by ID
    app.get("/properties/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const objectId = new ObjectId(id);
        const result = await propertiesCollection.findOne({ _id: objectId });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch property" });
      }
    });

    // POST / Create a new property
    app.post("/properties", async (req, res) => {
      try {
        const newProperty = req.body;
        const result = await propertiesCollection.insertOne(newProperty);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to create property" });
      }
    });

    // PUT / Update a property
    app.put("/properties/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const objectId = new ObjectId(id);
        const filter = { _id: objectId };
        const update = { $set: data };
        const result = await propertiesCollection.updateOne(filter, update);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to update property" });
      }
    });



    // Test MongoDB connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Keep the client open
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("HomeNest Server is Running!");
});

app.listen(port, () => {
  console.log(`HomeNest Server started on port: ${port}`);
});
