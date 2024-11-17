const express = require('express');
const router = express.Router();
const User = require("./../models/user")
const {jwtAuthMiddleware, generateToken} = require("./../jwt")


router.post("/signup", async(req, res)=>{
    
    try{
     const data = req.body;
     const newUser = new User(data);
   
     const response =  await newUser.save();
     
     const payload = {
      id:response.id,
    }
    
    console.log(JSON.stringify(payload))
     const token = generateToken(payload)
     console.log("Token is:", token);
     res.status(200).json({response: response, token: token});
    
    }
    catch(error){
      console.log(error);
      res.status(500).json({error: "internal server error"})
    }
   })
   
   router.post("/login", async(req, res)=>{
    try{
      const{adharCardNumber, password}= req.body;
      const user = await User.findOne({adharCardNumber:adharCardNumber});
      if(!user || !(await user.comparePassword(password))){
       return res.status(401).json({error: "Incorrect password"})
      }
      const payload = {
        id:user.id,
      }
      const token = generateToken(payload)  
      // res.status(200).json({token})
      res.json({token});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: "internal server error"})
    }
   })
   
   router.get("/profile",jwtAuthMiddleware, async(req, res)=>{
    try{
       const userData = req.user;       
       const userId = userData.id
       const user = await User.findById(userId);
       res.status(200).json(user);
      }catch(err){
        console.log(err);
        res.status(500).json({error: "internal server error"})
    }
   })

   

 router.put("/profile/password", jwtAuthMiddleware, async(req, res) =>{
     try{
      const userId = req.body.userId;
      const {currentPassword, newPassword} = req.body;
      const user = await User.findById(userId);
      if(!(await user.comparePassword(currentPassword))){
        return res.status(401).json({error: "Incorrect password"})
       }

       user.password = newPassword;
       await user.save();
      console.log("Password is updated");
      res.status(200).json({message: "Password updated"});
     }
      catch(error){
       console.log(error);
       res.status(500).json({error: "internal server error"})
      }

 })



 module.exports = router;