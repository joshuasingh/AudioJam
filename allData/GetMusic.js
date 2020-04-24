const MongoClient = require("mongodb").MongoClient;


const withDB = async (operations, res) => {
    try {
       const client = await MongoClient.connect(
        "mongodb+srv://joy:Joy@1995@cluster0-szqhn.mongodb.net/test?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
     
      
      const db = await client.db("Audio_Jam");
      const collection = await db.collection("Audio");
      await operations(collection,client);
      
      
    } catch (err) {
      console.log("error is ", err);
      res.status(202).json({status:'error'});
    }
  };
  


  module.exports.GetMusic=async(req,res)=>{
    withDB(async (db,client) => {
        await db.find({}).toArray(function(err, result) {
          if (err){
           console.log("error is",err)
           res.status(202).json({status:'error'});
          } 
          else{
          client.close()
           res.json({status:'success',result:result}).status(200);
          }
        });
      }, res);
    

  }