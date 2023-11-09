const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sopxnju.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("FoodDB");
    const foodCollection = database.collection("foods");
    const reqFoodCollection = database.collection("reqfoods");

    app.get("/foods", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    
    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id
      const Query = {_id: new ObjectId(id)}
      console.log(Query)
      const result = await foodCollection.findOne(Query)
      res.send(result)
    })

    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });


    app.put('/foods/:id', async(req,res) => {
      const id = req.params.id
      const foods = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updateFood = { $set: {
          foodName: foods.foodName,
          foodImg: foods.foodImg,
          status:foods.status,
          quantity:foods.quantity,
          pickUplocation: foods.pickUplocation,
          expireDate:foods.expireDate,
          note: foods.note
        }
      }
      try {
        const result = await foodCollection.updateOne(filter,updateFood, options);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the document.');
      }
    })

    app.delete('/foods/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      console.log(query)
      const result = await foodCollection.deleteOne(query)
      res.send(result)
    })


// apis for requested foods Collections 



app.get("/reqfoods", async (req, res) => {
  let query = {};
  if (req.query?.email) {
    query = { requesterEmail: req.query.email }; // Use requesterEmail here
  }
  const cursor = reqFoodCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});


app.get('/reqfoods/:id', async (req, res) => {
  const id = req.params.id
  const Query = {id: id}
  console.log(Query)
  const result = await reqFoodCollection.findOne(Query)
  res.send(result)
})

app.post("/reqfoods", async (req, res) => {
  const food = req.body;
  const result = await reqFoodCollection.insertOne(food);
  res.send(result);
});


app.patch('/reqfoods/:id', async (req, res) => {
  const id = req.params.id
  const filter = {_id: new ObjectId(id)}
  console.log(id, filter)
  const reqFoods = req.body;
  console.log('status', reqFoods)
  const updateDoc = {
    $set: {
      status: reqFoods.status
    }
  }
  const result = await reqFoodCollection.updateOne(filter, updateDoc)
  res.send(result)
})


app.delete('/reqfoods/:id',async(req,res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await reqFoodCollection.deleteOne(query)
  res.send(result)
})


    // Send a ping to confirm a successful connection
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
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`);
});
