const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lapzl7c.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const mobileCollection = client.db("mobile-shop-task").collection("mobiles")

    app.get("/mobiles", async (req, res) => {
        const { brand, min, max, memory, processor, type, name, OS } = req.query;
        let query = {}
        if(name){
            query = {name: { $regex: new RegExp(name, 'i') } }
        }
        if(brand){
            query = {brand: { $regex: new RegExp(brand, 'i') } }
        }
        if (min && max) {
            query.price = {
                $gte: parseFloat(min),
                $lte: parseFloat(max) 
            };
        }
        if(memory){
            query = {memory: { $regex: new RegExp(memory, 'i') } }
        }
        if(processor){
            query = {processor: { $regex: new RegExp(processor, 'i') } }
        }
        if(type){
            query = {type: { $regex: new RegExp(type, 'i') } }
        }
        if(OS){
            query = {OS: { $regex: new RegExp(OS, 'i') } }
        }
       
        const cursor = mobileCollection.find(query)
        min && max && cursor.sort({ price: 1 })
        const result = await cursor.toArray()
        res.send(result)
    })
    app.get("/mobiles/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await mobileCollection.findOne(query)
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("mobile-shop is running")
})

app.listen(port, () => {
    console.log(`mobile-shop is running on port ${port}`)
})