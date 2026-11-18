import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// কানেক্ট করার জন্য
const connectedClient = await connectToMongoDB();

app.get("/", (req, res) => {
  res.send({ message: "mentor lagbe is ready..." });
});

app.listen(port, () => {
  console.log(`Mentor lagbe is running on port : ${port}`);
});
