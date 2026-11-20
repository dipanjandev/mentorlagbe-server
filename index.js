import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
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
const database = connectedClient.db("mentorlagbe-db");
const users = database.collection("user");
const tuitions = database.collection("tuitions");
const applications = database.collection("applications");
const payments = database.collection("payments");
const sessions = database.collection("session");

app.get("/", (req, res) => {
  res.send({ message: "mentor lagbe is ready..." });
});

// get user information...
app.get("/users", async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
});

// Tuition Post Related API's
app.post("/tuitions", async (req, res) => {
  const tuition = req.body;
  const result = await tuitions.insertOne(tuition);
  res.send(result);
});

app.get("/tuitions", async (req, res) => {
  // এখানে আমার কুয়েরির কাজ করব ফ্রন্ট এন্ড থেকে যেটা পাঠিয়েছিলাম।
  const query = {};
  // console.log("query", req.query);
  if (req.query) {
    if (req.query.classLevel) {
      query.classLevel = req.query.classLevel;
    }
    if (req.query.mode) {
      query.mode = req.query.mode;
    }
    if (req.query.daysPerWeek) {
      query.daysPerWeek = Number(req.query.daysPerWeek);
    }
    // সার্চের জন্য এটা করা হল।
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }
  }

  // পেজিনেশন এর জন্য কাজ করা হল এখানে।
  const totalItems = await tuitions.countDocuments(query);
  let cursor = tuitions.find(query);
  let totalPages = 1;

  if (req.query.page) {
    const page = Number(req.query.page);
    const limit = 6;
    const skip = (page - 1) * limit;

    totalPages = Math.ceil(totalItems / limit);
    cursor = cursor.skip(skip).limit(limit);
  }

  const result = await cursor.toArray();
  // ফ্রন্টএন্ডে গিয়ে data.tuitions-এর বদলে data.result লিখতে হতো তাই এখানে result এর আগে tuitions ব্যবহার করা হল।
  res.send({ tuitions: result, totalItems, totalPages });
});

app.delete("/tuitions/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await tuitions.deleteOne(query);
  res.send(result);
});

// ডাটা আপডেট করার জন্য
app.patch("/tuitions/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const result = await tuitions.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData },
  );
  res.send(result);
});

app.listen(port, () => {
  console.log(`Mentor lagbe is running on port : ${port}`);
});
