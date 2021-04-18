const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
//const bodyParser = require('body-parser')
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Laundryes!')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g3qco.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection error', err);
    const serviceCollection = client.db("laundryes").collection("services");
    const reviewCollection = client.db("laundryes").collection("reviews");

    app.get('/services', (req, res) => {
      serviceCollection.find()
      .toArray((err, items) => {
          res.send(items)
        console.log(items);
      })
    })

    app.get('/service/:id', (req, res) => {
      console.log(req.params.id);
     serviceCollection.find({_id: ObjectId(req.params.id)})

       .toArray (( err, items) => {
         res.send(items[0]);
        console.log(items);
       
      })
    })

    app.post('/addservice', (req, res)=> {
        const newService = req.body;
        console.log('adding new book', newService);
        serviceCollection.insertOne(newService)
        .then(result => {
          console.log('inserted count', result.insertedCount);
          res.send(result.insertedCount > 0)
        })
      })

      app.get('/reviews', (req, res) => {
        reviewCollection.find()
        .toArray((err, items) => {
            res.send(items)
          console.log(items);
        })
      })

      app.post('/addreview', (req, res)=> {
        const newReview = req.body;
        console.log(newReview);
        reviewCollection.insertOne(newReview)
        .then(result => {
          console.log('inserted count', result.insertedCount);
          res.send(result.insertedCount > 0)
        })
      })


     

})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })