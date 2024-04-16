const mysql= require('mysql');
const dotenv= require('dotenv');
dotenv.config();
const connection = mysql.createConnection({
  host:process.env.HOST,
  user:process.env.USER,
  password:process.env.PASSWORD,
  database :process.env.DATABASE 
   //port:3306
});
 
connection.connect(function(err) {
  if (err)throw err;
 
  console.log('database connected ');
});
module.exports=connection