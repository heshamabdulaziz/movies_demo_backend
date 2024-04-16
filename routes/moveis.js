
const router=require('express').Router()
 const {data}=require("../db/data");
 const conn=require("../db/dbConnection");
const adminAuth = require("../middelware/admin");
const autherize = require('../middelware/authorize');
const util=require("util");// helper func
const {body,check,validationResult} = require('express-validator');
const upload=require('../middelware/uploade_imgs');
const fs=require("fs");
const { create_reveiew_validation, error_validation, create_movie_validation } = require('../middelware/validatation');

  //Search  by name
   router.get("/search",async(req,res)=>{ 
          const {q}=req.query;
          const search_txt=req.query.q;
          const query=util.promisify(conn.query).bind(conn);
          //three way to search q+'%'start|| '%'+q+'%' conain or '%'+q end 
          const results=await query(`select * from movies where name like ? or description like ?`
          ,[q+'%',q+'%']);
          if (results){
            results.map((img)=>{
             img.image_url=`http://${req.hostname}:3000/${img.image_url}`;
            })
            res.status(202).json(results) 
          }
                else 
                  res.status(404).json({msg:" there are not any results by this name" }) 

        })

//list of all movies 
router.get("",async(req,res)=>{ 

        const query=util.promisify(conn.query).bind(conn);
        //anthor way to make seach query
         let search_txt="";
         
        if(req.query.q){search_txt=`where name like '${req.query.q}%' or description like '${req.query.q}%'`;
      console.log(req.query.q);}
        const results=await query(`select * from movies ${search_txt}`);
              if (results){
                results.map((img)=>{
                 img.image_url=`http://${req.hostname}:3000/${img.image_url}`;
                })
                res.status(202).json(results) }
              else 
                res.status(404).json({msg:" there are not any movei" }) 

})

// get movei by   id 
router.get('/:id',async(req,res)=>{ 
          const{id}=req.params;
          const query=util.promisify(conn.query).bind(conn);
          const results=await query(`select * from movies where id= ?`,[id]);
                if (results[0]){ 
                  results[0].image_url=`http://${req.hostname}:3000/${results[0].image_url}`;
                  res.status(202).json(results) }
                else 
                res.status(404).json({msg:`there are not results by this ID` 
              

              });

    
})

// admin read ,create, update, delete 
// Create new Movei
router.post("",adminAuth,upload.single("image"),create_movie_validation(),
          async(req,res)=>{
          try {
              //1- validation Requests 
              const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })}
          //1- validate image
          if (!req.file) {
            res.status(400).json({errors:[{"msg":"image is required"}]})}
        
            //transform  sql query to promise to  use await//async
            const query=util.promisify(conn.query).bind(conn);
            //-prepare object data to save to db
            const new_Object={
              name:req.body.name,
              description:req.body.description,
              image_url:req.file.filename
            }
        //insert data to db
          await query("insert into movies set ?",new_Object);
          res.status(201).json({msg:"movei is created succesfully"});
        } //end try
          catch(err) {
            console.log(err);
              res.status(500).json({err:err});
          } //end catch
              
          })

// Update new Movei
router.put("/:id",adminAuth,upload.single("image"),
       body("name").isString().withMessage("Please enter valid movi name")
      .isLength({min:3}).withMessage("name should be at lease 3 charcter"),
       body("description").isString().withMessage("Please enter valid description")
      .isLength({min:20}).withMessage("name should be at lease 20 charcter"),
   async(req,res)=>{
     try {
        //1- validation Requests 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() })}
            //transform  sql query to promise to  use await//async
          const query=util.promisify(conn.query).bind(conn);
      // check if movie exit or NO
    const results=await query("select * from movies where id = ?",[req.params.id]);
    if(!results[0]){
      res.status(400).json({msg:"this movei is not found"});
    }
    
      //-prepare object data to update to db
      const update_object={
        name:req.body.name,
        description:req.body.description,
      }
     //1- validate image
     if (req.file) {
      update_object.image_url=req.file.filename;
      fs.unlinkSync("./upload/"+results[0].image_url);
      }
    
       //-update  movie 
       await query("update movies set ? where id = ?",[update_object,req.params.id]);
       res.status(200).json({msg:"movei is updated succesfully"});

     } // end of try
     catch(err) {
      console.log(err);
        res.status(500).json({err:err});
     }
        

})

//delete new Movei
router.delete("/:id",adminAuth,async(req,res)=>{
     try {
       //transform  sql query to promise to can use await//async
       const query=util.promisify(conn.query).bind(conn);
      // check if movie exit or NO
       const results=await query("select * from movies where id = ?",[req.params.id]);
    if(!results[0]){
      res.status(400).json({msg:"this movei is not found"});
    }
    // remove image
      fs.unlinkSync("./upload/"+results[0].image_url);
    
       //-delete movie 
       await query("delete from movies where id = ?",[req.params.id]);
       res.status(200).json({msg:"movei is deleted succesfully"});

     } // end of try
     catch(err) {
        console.log(err);
        res.status(500).json({err:err});
     }
        

})

// movie_reivew 
router.post('/reveiw',autherize,create_reveiew_validation(),     
(req,res)=>{
  //const query=util.promisify(conn.query).bind(conn);
  //1- validation Requests 
  const errors =validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })}
   // check if movie exit or NO
    const sql='select * from movies where id = ?';
    conn.query(sql,[req.body.movei_id],(err,data)=>{
      if(err){
        res.status(400).json({msg:"this movei is not found"});
      }
      if(data){
        const review_Object={
          user_id:res.locals.user.id,
          movei_id:data[0].id,
          reveiw:req.body.reveiw,}
          const sql='insert into userreveiw set user_id=? movei_id=?,reveiw=?';
          conn.query(sql,[review_Object.user_id,review_Object.movei_id,review_Object.reveiw]);
          res.status(201).json({msg:"reveiw created successfully"});
        
      } //end if
      

    });

//       const results=await query("select * from movies where id = ?",[req.body.movei_id]);
//       if(!results[0]){
//         res.status(400).json({msg:"this movei is not found"});
//       }
 //-prepare movie_review object to save to db
//  const review_Object={
//    user_id:res.locals.user.id,
//    movei_id:results[0].id,
//    reveiw:req.body.reveiw,}
 //res.json(review_Object);
 //insert data to db
//  await query("insert into userreveiw set ?",review_Object);
//  res.status(201).json({msg:"reveiw created successfully"});
    
  } 
  catch(erro) {
    console.log(erro);
    res.status(500).json({erro:erro});
 }


})



module.exports=router;