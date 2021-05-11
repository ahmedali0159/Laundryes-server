const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const admin = require("firebase-admin");
//const bodyParser = require('body-parser')
require("dotenv").config();
const port = process.env.PORT || 5000;

const serviceAccount = require("./configs/laundryes-firebase-adminsdk-ihcxw-1c470d8fa4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Laundryes!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g3qco.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("connection error", err);
  const serviceCollection = client.db("laundryes").collection("services");
  const reviewCollection = client.db("laundryes").collection("reviews");
  const orderCollection = client.db("laundryes").collection("orders");
  const adminCollection = client.db("laundryes").collection("admins");

  app.post('/isAdmin', (req, res) => {
    console.log(req.body);
    adminCollection.find(req.body)
        .toArray((err, admin ) => {
            res.send(admin.length > 0);
        })
})

app.post("/makeAdmin", (req, res) => {
  console.log(req.body);
  const newAdmin = req.body;
  adminCollection.insertOne(newAdmin).then((result) => {
    console.log("inserted count", result.insertedCount);
    res.send(result.insertedCount > 0);
  });
});

  app.post("/addorders", (req, res) => {
    const newOrdered = req.body;
    orderCollection.insertOne(newOrdered).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    const bearer = req.headers.authorization
    if(bearer && bearer.startsWith('Bearer ')){
    const idToken = bearer.split(' ')[1];
    admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const tokenEmail = decodedToken.email;
      const queryEmail = req.query.email;
      if(tokenEmail == queryEmail){
        
    orderCollection.find({email:queryEmail})
    .toArray(( err, items) => {
      res.status(200).send(items)
      
    })
      }
      else{
        res.status(401).send('Un_Authorized access')
      }
      // ...
    })
    .catch((error) => {
      res.status(401).send('Un_Authorized access')
    });

    }
    else{
      res.status(401).send('Un_Authorized access')
    }
   
  });

  app.get("/services", (req, res) => {
    serviceCollection.find().toArray((err, items) => {
      res.send(items);
      console.log(items);
    });
  });

  app.get("/service/:id", (req, res) => {
    console.log(req.params.id);
    serviceCollection
      .find({ _id: ObjectId(req.params.id) })

      .toArray((err, items) => {
        res.send(items);
        console.log(items);
      });
  });

  app.post("/addservice", (req, res) => {
    const newService = req.body;
    console.log("adding new book", newService);
    serviceCollection.insertOne(newService).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewCollection.find().toArray((err, items) => {
      res.send(items);
      console.log(items);
    });
  });

  app.post("/addreview", (req, res) => {
    const newReview = req.body;
    console.log(newReview);
    reviewCollection.insertOne(newReview).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteService/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((err, result) => {
        console.log(result);
      });
  });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
