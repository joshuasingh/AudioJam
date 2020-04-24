//import CheckJwt from "../src/security/CheckJwt";
var http = require("http");
const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');
var {AWSKey}=require("./Keys1/Security")
var express = require("express");
var cors = require("cors");
var app = express();
var {GetMusic}=require("./allData/GetMusic")
var {setVideoInfo}=require("./userAction/userUpload")
var {setUserInfo}=require("./userAction/userUpload")
 var {getUserInfo}=require("./userAction/userUpload")
 var {uploadVideo}=require("./userAction/userUpload")
 var ffmpeg = require('fluent-ffmpeg');
 var ThumbnailGenerator=require('video-thumbnail-generator');



var WSS = require("ws").Server;
app.use(cors());

const MongoClient = require("mongodb").MongoClient;

var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb", extended: false }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));



const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const bcrypt = require("bcrypt");



aws.config.update({
  secretAccessKey: AWSKey.AWSSecretKey,
  accessKeyId:AWSKey.AWSAccessKeyId,
  region: "ap-south-1"
});

const s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "myaudiojam",
    acl: "public-read",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function(req, file, cb) {
      cb(null, "Video/" + Date.now().toString());
    }
  })
});

const singleupload = upload.single("file");

const multer1 = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});




app.post('/upload/Thumbnail',(req, res) => {
  console.log('Upload Image called');

  
  ysingleupload(req, res, function(err) {
    //this gives us where the image is stored
    console.log(req.file)
    try {
      if (err) {
        console.log("called inside" + err);
        res.json({ status: "error" }).status(500);
      } else {
        console.log(req.file.location, req.file.key);
          res.status(200).json({status:"success",result:req.file.location})
        
      }
    } catch (err) {
      console.log("in catch");
      res.status(200).json({ error: "InternalError" });
    }
  });

});





var server = http.createServer(app);


server.listen(process.env.PORT || 8081, () => {
  console.log("server is listening on port 8081");
});


//get All for the App
app.get("/allMusic",(req,res)=>{
   GetMusic(req,res)
})


//createUser on create Login
app.post("/createUser",(req,res)=>{
  console.log("in create user",req.body.userId)
  setUserInfo(req,res)
})


//upload video
app.post("/UploadVideo",(req,res)=>{
  console.log("in video upload")
 
  uploadVideo(req,res)
})

//get user information
app.post("/getUser",(req,res)=>{
  console.log("in get user ")
  getUserInfo(req,res)
})






app.post("/thumbnail", (req, res) => {

  const tg = new ThumbnailGenerator({
    sourcePath: req.body.url,
    thumbnailPath: './upload/',
    });

console.log("thumnbnail called")

tg.generate({
  size: '200x200'
})
  .then(console.log("done"));

});













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





app.post("/hello/:name", (req, res) => {
  ``;
  console.log("called",req.body.name)
  res.status(200).send(req.body.name)
});

var articleInfo;

//getting all the data to show
app.get("/allData", (req, res) => {
  console.log("called");

  withDB(async (db,client) => {
    await db.find({}).toArray(function(err, result) {
      if (err){
       console.log("error is",err)
      } 
      console.log("result is here",result)
      client.close()
       res.json(result).status(200);
    });
  }, res);

});


//update the data
app.post("/updateData", (req, res) => {
  checkHeaderAuth(
    async userrr => {
      try {
        console.log(
          "called updating",
          req.body.id,
          req.body.title,
          req.body.value
        );
        var temp = req.body.id;
        // var temp = "Mickey";
        console.log(temp);
        var myquery = { _id: ObjectID(temp) };
        // var myquery = { title: "this is the second" };
        var newvalues = {
          $set: { title: req.body.title, value: req.body.value }
        };
        withDB(async db => {
          await db.updateOne(myquery, newvalues, function(err, obj) {
            if (err) {
              console.log("error occured", err);
              throw err;
            } else {
              console.log("document updated");
            }
            getAll(req, res);
          });
        }, res);
      } catch (err) {
        res.status(401).json({ status: "error occures:" + err });
      }
    },
    req,
    res
  );
});

