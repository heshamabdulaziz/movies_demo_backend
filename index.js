// ======== intialize express App ============
const express=require('express')
const app=express()
// =========== Global Middleware ================
  app.use(express.json())
  app.use(express.urlencoded({ extended: true })); // Allow to access x-www-form encoded
  app.use(express.static("upload")); //explain to express this is public(upload) folder
  const cors=require('cors')  // allow http requst local hosts
  app.use(cors());
  
  // 
  const port=process.env.PORT||3000;
// ============= Require modules ================
const auth=require('./routes/auth.js')
const movies=require("./routes/moveis.js");
const users=require("./routes/users.js");
// ============= API Routes [endpoint] ================
app.use("/auth",auth)
app.use("/movie",movies)
app.use("/user",users)

//error middelware
app.use((req,res)=>{
    res.setHeader("Content-Type", "text/html");
    res.status(404).json('<h1> ERROR 404 PAGE IS NOT FOUND  <h1>') 
    
    
})
// ============= RUN THE APP ================
const server =app.listen(port,"localhost",()=>{
  
    console.log(console.log(`server is running in port ${port}`))
}) 
