const {check,validationResult} = require('express-validator');
//create_reveiew_validation
const create_movie_validation=()=>{
    return [check("name").isString().withMessage("Please enter valid movi name")
    .isLength({min:3}).withMessage("name should be at lease 3 charcter"),
     check("description").isString().withMessage("Please enter valid description")
    .isLength({min:20}).withMessage("name should be at lease 20 charcter")
]
 
 }
//create_reveiew_validation
 const create_reveiew_validation=()=>{
   return check("reveiw").isString().withMessage("Please enter valid reveiw")
           .isLength({min:1}).withMessage("reveiw is required");



}

module.exports={
    create_movie_validation,
    create_reveiew_validation,
    
};