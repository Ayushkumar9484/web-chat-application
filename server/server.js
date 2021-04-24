const path=require("path")
const express=require("express")
const http=require("http")
const socketIO=require("socket.io")
const mongo=require("mongodb").MongoClient
const app=express();
const page_path=path.join(__dirname,"../public")
let server=http.createServer(app)
let io=socketIO(server)

app.use(express.static(page_path))

io.on("connection",(socket)=>{
    console.log("new user connected")
    socket.on("disconnect",()=>{
        console.log("disconnected ")
    })
})

mongo.connect("mongodb://localhost:27017/mongochat", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
},(err,db)=>{
   const database= db.db("mongochat")
    // await database.createCollection("chats",async (err,data)=>{
    //     database.collection("chats").insertOne({name:"ayush",class:"2nd year"},(err,res)=>{
    //         if(err) console.log(err)
    //         console.log("document inserted")
    //     })
    // })
     io.on("connection",(socket)=>{
         const chat=database.collection("chats")

         sendstatus=(s)=>{
             io.emit("status",s)
         }
         chat.find().limit(100).sort({_id:1}).toArray((err,res)=>{
             if(err) throw err

             socket.emit("output",res)
         })

         socket.on("input",(data)=>{
             let name=data.name
             let message=data.message

             if(name=="" || message =="")
             sendstatus("please enter valid name and message")
             else{
                 chat.insertOne({name:name,message:message},()=>{
                     io.emit("output",[data])

                     sendstatus({
                         messsage:"message sent",clear:true
                     })
                 })
             }
         })

         socket.on("clear",()=>{
             chat.deleteMany
             ({},()=>{
                 socket.emit("cleared")
             })
         })
     })
 })

server.listen(8000,()=>{
    console.log("connection")
})