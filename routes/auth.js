const router=require('express').Router();
const conn=require("../db/dbConnection");
const bcrypt=require('bcrypt');
const crypto=require('crypto');
const util=require("util");// helper fun
const {body,validationResult } = require('express-validator');

// ===================Login =======================

router.post('/login',
    body("email").isEmail().withMessage("Please enter valid email"),
    body("password").isLength({min:8,max:12}).withMessage("password should between 8-12 charcter")
,async(req,res)=>{
     try {
        //1- validation Request [manual or using packagelike express validation]
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })}
// 2-check if email exists
//transform  sql query to promise to  use await//async
const query=util.promisify(conn.query).bind(conn);

 const user= await query(`select * from users where email= ?`, [req.body.email]);
   if(user.length==0){
      res.status(404).json({errors:[{"msg":" email or password not found"}]})}
  
    //3-comper hashed  password
    const checkpasword=await bcrypt.compare(req.body.password,user[0].password)
      if(checkpasword){
        delete user[0].password;
      res.status(200).json(user);
      }
      else{ 
       res.status(404).json({errors:[{"msg":" email or password not found"}]})}
  

     } 
     catch(err) {
      console.log(err);
        res.status(500).json({err:err});
     }
        

})

//===================Registration=======================
router.post('/register',
    body("email").isEmail().withMessage("Please enter valid email"),
    body("name").isString().withMessage("Please enter valid name")
   .isLength({min:10,max:20}).withMessage("name should between 10-20 charcter"),
    body("password").isLength({min:8,max:12}).withMessage("password should between 8-12 charcter")
,async(req,res)=>{
     try {
        //1- validation Request [manual or using packagelike express validation]
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })}
//2-check if email exists
//await//async
//transform  sql query to promise to  use await//async
const query=util.promisify(conn.query).bind(conn);


 const checkEmailExists= await query(`select * from users where email= ?`, [req.body.email]);
   if(checkEmailExists.length > 0){
     return res.status(400).json({errors:[{"msg":"this user already exist!"}]})}
    
    //3-prepare object user to save to db
  const userData={
        name:req.body.name,
        email:req.body.email,
        password:await bcrypt.hash(req.body.password,10),
        token:crypto.randomBytes(16).toString('hex') , //JWT or using crypto randam encrypation standerd
      }
   //4-insert user  object user to db
     await query("insert into users set ?",userData);
      delete userData.password;
       res.status(200).json(userData);


     } 
     catch(err) {
      console.log(err);
        res.status(500).json({err:err});
     }
        

})


module.exports=router;