
const conn=require("../db/dbConnection");
 const util=require("util");// helper fun
const adminAuth= async(req,res,next)=>{
    const {token}=req.headers;
    const query=util.promisify(conn.query).bind(conn);

    const user= await query(`select * from users where token= ?`,[token]);// chek user login or no
    if(user[0]&&user[0].role=='1'){
        next()
      }else{   
        res.status(400).send({"massage":"you are not autherize to Access this route"});
    }
    

    
    }
    module.exports=adminAuth;





