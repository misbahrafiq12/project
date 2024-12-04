
 import prisma from "../DB/db.config.js";
 import bcrypt from "bcrypt"
 import jwt from 'jsonwebtoken'
 const expiresAt = new Date();
 console.log(expiresAt,"...");
 
expiresAt.setHours(expiresAt.getHours() + 1)
console.log(expiresAt);


// register
export const register = async(req,res)=>{
  const otp = Math.floor(1000 + Math.random() * 9000)
  console.log(otp);
  
    const {email,password} = req.body
    const foundUser= await prisma.user.findUnique({
        where:{
            email
        }
    })
    if (foundUser) {
        return res.status(400).json({msg:"User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const createUser= await prisma.user.create({
        data:{
            email,
            role:"USER",
            userSecret:{
                create:{
                    password:hashedPassword,
                    otp:otp.toString(),
                    expiresAt: expiresAt.toISOString(),

                }
            } 

        },
        include:{
            userSecret:true
        }
        
    })
    const accessToken = jwt.sign(
      { user: createUser.id },
      
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
  
    
    const refreshToken = jwt.sign(
      { user: createUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    const userSession = await prisma.session.create({
      data: {
        refreshToken,
        userId: createUser.id
      }
    });
    createUser.accessToken = accessToken
    createUser.sessionId = userSession.id
    return res.status(200).json({createUser})
}

// login

export const login = async (req, res) => {
      try {
        const { email, password } = req.body;
    
       const matchedUser = await prisma.user.findFirst({
          where: { email },
          include: { userSecret: true }
        });
  
         console.log(matchedUser,"............");
       
        if (!matchedUser) {
          return res.status(404).json({ error: "User doesn't exist" });
        }
        const hashedPass =  bcrypt.compare(password, matchedUser.userSecret?.password);
        if (!hashedPass) {
          return res.sendStatus(401);
        }
        const accessToken = jwt.sign(
          { user: matchedUser.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        console.log("matchedUser");
        
        const refreshToken = jwt.sign(
          { user: matchedUser.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "3d" }
        );
    
        const userSession = await prisma.session.create({
          data: {
            refreshToken,
            userId: matchedUser.id
          }
        });
     console.log(matchedUser);
     
    //   const user={
    //     matchedUser,
    //     accessToken
    //   }
      
      matchedUser.accessToken = accessToken
      matchedUser.sessionId = userSession.id
        // const modifieduser = UserLoginDTO(user)
        res.status(200).json({matchedUser})
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
      }
    };

    //verify otp 

    export const verifyOtp = async (req, res) => {
      try {
        const {userId}= req
        const { otp } = req.body;
        const currentDate = new Date();
    console.log(currentDate,"currentdate");
    
       
        const foundUser = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            userSecret: true,
          },
        });
    
        if (!foundUser) {
          return res.status(404).json({ msg: "User not found" });
        }
    
        
        const userSecret = foundUser.userSecret;
        if (userSecret.expiresAt > currentDate && userSecret.used === false) {
          console.log(userSecret.expiresAt,"expiresAt");
          
          if (userSecret.otp === otp) {

            await prisma.userSecret.update({
              where: {
                id: userSecret.id,
              },
              data: {
                used: true,
              },
            });
    
            return res.status(200).json({ msg: "User is verified" });
          }
        }
    
      
        return res.status(400).json({ msg: "User is not verified" });
      } catch (error) {
        return res.status(500).json({ msg: "Server Error", Error: error.message });
      }
    };

    // resendOTP
   export const resendOtp =async (req,res)=>{
    const {userId} = req
      const otp = Math.floor(1000 + Math.random() * 9000)
      await prisma.userSecret.update({
        where: {
          userId,
        },
        data: {
          otp : otp.toString()
        },
      });
      console.log(otp,".......");
      
      return res.status(200).json({ msg: "User is  resend otp" });
    }

    // logout

    export const logOut = async (req, res) => {
      try {
        const {sessionId}=req.params
        const { userId } = req;
        if (!userId) {
          return res.status(400).json({ msg: "User ID is required" });
        }
        const updatedSessions = await prisma.session.updateMany({
          where: { id:sessionId} ,
          data: { refreshToken: "" },
        });
    
        console.log("Sessions logged out:", updatedSessions);
        return res.status(200).json({ msg: "Sessions successfully logged out" });
      } catch (error) {
        console.error("Error logging out sessions:", error);
        return res.status(500).json({ msg: "Internal server error" });
      }
    };
    
   
    // refreshToken
    export const refreshToken = async(req,res)=>{
      try{
        const {userId} = req;
        session

        if(!refreshToken) return res.status(401).json({msg:"refreshToken is required"});

       

      }catch(error){
        return res.status(500).json({ msg: "Internal server error" });
      }
    }