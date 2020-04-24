
const MongoClient = require("mongodb").MongoClient;




module.exports.withDB = async (operations, res) => {
    try {
       const client = await MongoClient.connect(
        "mongodb+srv://joy:Joy@1995@cluster0-szqhn.mongodb.net/test?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
      
      const db = await client.db("Audio_Jam");
      const collection = await db.collection("App_Info");
      await operations(collection,client);
      
      
    } catch (err) {
      console.log("error is ", err);
      res.status(500).send(err);
    }
  };
  