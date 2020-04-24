const MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

var {upload}=require("../AwsConnect/S3Connect")




var userStructure={
   userId:"",
   bio:"" ,
   profile_pic:"",
   Video:{
       url:"",
       caption:"",
       comments:""
   }
}









//mongo db connection service

const withDB = async (operations, res) => {
    try {
       const client = await MongoClient.connect(
        "mongodb+srv://joy:Joy@1995@cluster0-szqhn.mongodb.net/test?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
       console.log("connected")
      
      const db = await client.db("Audio_Jam");
      const collection = await db.collection("Users");
      await operations(collection,client);
      
      
    } catch (err) {
      console.log("error is ", err);
      res.status(500).send(err);
    }
  };
  

//first user info set 

module.exports.setUserInfo=async(req,res)=>{
    
  var info={...userStructure,userId:req.body.userId}
   
  
  withDB(async db => {
        await db.insertOne(info, function(err, obj) {
          if (err) {
            console.log("couldn't get the data",err);
            res.json({status:"error"}).status(500);
            return 
          } else {
            console.log("item added");
            res.json({status:"success",result:obj}).status(200);
          }
        });
      }, res);
  }



module.exports.setVideoInfo=async(req,res)=>{
    
    var info=userStructure
    info.userId=req.body.userId
    info.Bio=req.body.bio

      withDB(async db => {
        await db.insertOne(info, function(err, obj) {
          if (err) {
            console.log("couldn't get the data");
            res.send("unable to do it").status(500);

            throw err;
          } else {
            console.log("item added");
            res.send("done").status(200);
          }
        });
      }, res);
  }


  //get users info from the userId
module.exports.getUserInfo=async(req,res)=>{
    console.log("called susre",req.body.userId)
   var id=req.body.userId
  try{
    withDB(async db => {
        await db.find({userId:id}).toArray(function(err, result) {
          if (err)
          {
            res.json({status:"error"}).status(500)
          } 
          if(result)
          {
              
            res.json({status:"success",result:result}).status(200)
          }
          
        });
      }, res);
    }catch(e)
    {
        console.log("in catch",e)
        res.json({status:"error"}).status(500)
    }
  
    }




//get user info in function
var getUser=(id,res)=>{
 
     console.log("get user",id)
    try{
    withDB(async db => {
        await db.find({userId:id}).toArray(function(err, result) {
          if (err)
          {
            res.json({status:"error"}).status(500)
          } 
          if(result)
          {
              console.log("in result",result)
            res.json({status:"success",result:result}).status(200)
          }
          
        });
      }, res);
    }catch(e)
    {
        console.log("in catch",e)
        res.json({status:"error"}).status(500)
    }
  

}




//upload value to mongodb
    var updateMongo=(userId,url,caption,res)=>{
      console.log("mongo called")

       var temp=[{
          url:url[0],
          caption:caption,
          thumbnail:url[1]
        }]
      
        var myquery = { userId:userId };
        // var myquery = { title: "this is the second" };
        var newvalues = { $addToSet: { Video: { $each: temp } } };
      
        withDB(async db => {
          await db.updateOne(myquery, newvalues, function(err, obj) {
            if (err) {
              console.log("error occured", err);
              res.send({status:"error"}).status(500)
              throw err;
            } else {
                console.log("succ")
              //  res.send({status:"success"}).status(500)
              getUser(userId,res)

            }
           });
        }, res);
      
      }
      
      
 



      const singleupload1 = upload.array("file");
      
   //upload video to server
   module.exports.uploadVideo=(req,res)=>{
    console.log("in video upload")
   
     singleupload1(req, res, function(err) {
      
         
      try {
        if (err) {
          console.log("called inside" + err);
          res.json({ status: "error" }).status(500);
        } else {
          //console.log(req.file.location, req.file.key);
          
        var temp=[]   
        
        req.files.map(val=>{
            console.log("urlsss",val.location)
            temp.push(val.location)
        })
        console.log("userid",req.body.file[0])
        updateMongo(req.body.file[0],temp,req.body.file[1],res)

        }
      } catch (err) {
        console.log("in catch",err);
        res.json({ status: "error" }).status(500);
      }
    });
  
  
  }



