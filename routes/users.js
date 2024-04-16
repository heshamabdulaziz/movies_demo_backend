
const router=require('express').Router()
 const {users_data}=require("../db/data")

 

 //Search about user
 router.get('/search',(req,res)=>{
    const {q,id}=req.query;
res.send(`query q; ${q}and id:${id} `) 
 })


// get all users_data
    router.get('/',(req,res)=>{
         
    res.send(users_data) 
     })

// get uesr by id 
router.get('/:Id',(req,res)=>{ 
    const {Id}=req.params;
    let user=users_data.filter((el)=>el.id===+Id)
    if(!user) return res.status(400).send({massage:"the user is not found"})
    res.status(200).send(user)
})


// create new user
router.post('/createUser',(req,res)=>{
    let newuser=req.body;
    users_data.push(newuser);
    res.send({
        "massage": "user Created successfully"
    })
})

//update user
router.put("/:Id",(req,res)=>{ 
   const{Id}=req.params;
   const index=users_data.findIndex(el=>el.id==Id)
   if (index==-1){return res.status(400).send('The user is not found')} 
   users_data[index].email= req.body.email;
   users_data[index].password= req.body.password;
   return res.status(200).send(users_data)

})

//delete
router.delete('/:Id', (req, res) => { 
    const { Id } = req.params;
    const index = users_data.findIndex(el => el.id === +Id);
    if(index!=-1){ return res.status(201).send(`user deletete succesfully `)}
    res.send(`uesrs is not found`);
});
module.exports=router;