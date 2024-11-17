const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate");
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

const checkAdminRole = async (userId) => {
  try {
    const user = await Candidate.findById(userId);
    if(user.role === "admin"){
        return true;
    }
  } catch (err) {
    return false;
  }
};

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (await !checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user has not admin role" });

    const data = req.body;
    const newCandidate = new Candidate(data);

    const response = await newCandidate.save();
    console.log("data is saved")
    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user has not admin role" });
    const candidateId = req.params.candidateId;
    const updateCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updateCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(404).json({ error: "candidate Not found" });
    }

    console.log("candidate data is updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user has not admin role" });
    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: "candidate Not found" });
    }

    console.log("candidate data is deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res)=>{

 const candidateId = req.params.candidateId;
 const userId = req.user.id;

 try{
    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
      return res.status(404).json({message:"candidate not found"})
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"user not found"})
    }

    if(user.isVoted){
      res.status(400).json({message:"user is already voted"})
    }

    if(user.role === "admin"){
      res.status(400).json({message:"admin is not allow"})
    }

    candidate.votes.push({user:userId});
    candidate.voteCount++;

    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({message:"vote recorded successfully"})
 }catch(error){
  console.log(error);
  res.status(500).json({ error: "internal server error" });
 }
})


router.get("/vote/count", async(req, res)=>{
  try{
     const candidate = await Candidate.find().sort({voteCount: "desc"})

     const voteRecord = candidate.map((data)=>{
      return{
        party: data.party,
        count: data.voteCount
      }
     });
     return res.status(200).json(voteRecord);
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
})

router.get("/", async(req,res)=>{
  try{

    const candidate = await Candidate.find();
    return res.status(200).json(candidate)
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
})
module.exports = router;
