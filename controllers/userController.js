
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
      { expiresIn: "1h" }
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
    // createUser.sessionId = userSession.id
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
  
       
       
        if (!matchedUser) {
          return res.status(404).json({ error: "User doesn't exist" });
        }
        const hashedPass =  await bcrypt.compare(password, matchedUser.userSecret?.password);
        if (!hashedPass) {
          return res.status(400).json({msg:"Invalid password"});
        }
        const accessToken = jwt.sign(
          { user: matchedUser.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
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
          return res.status(400).json({ msg: "OTP is not correct" });
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
        if (!userId) {
      return res.status(400).json({ msg: "User ID is missing " });
    }

    // console.log("Received userId:", userId);
       
     const findUser = await prisma.user.findUnique({
    where:{id:userId}
     })
    if(!findUser) return res.status(400).json({msg:"user is not find"})

    const accessToken = jwt.sign(
        { user: findUser.id},
        
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).json({msg:"accessToken generate successfully",accessToken})

      }catch(error){
        return res.status(500).json({ msg: "Server Error" ,Error:error.message});
      }
    }

    
// changePasword
export const changePassword = async (req, res) => {
  const { userId } = req;  // Assuming the userId is set by the JWT middleware
  const { currentPassword, newPassword } = req.body;

  // Check if both passwords are provided
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  console.log('Current Password:', currentPassword);
  console.log('New Password:', newPassword);

  try {
    // Find the user
    const checkUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSecret: true }
    });

    if (!checkUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Compare the current password
    const checkPassword = await bcrypt.compare(currentPassword, checkUser.userSecret?.password);

    if (!checkPassword) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash the new password
    if (!newPassword) {
      return res.status(400).json({ msg: "New password is required" });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);  // Ensure `newPassword` is passed correctly

    // Update the password
    const updatedPassword = await prisma.user.update({
      where: { id: userId },
      data: {
        userSecret: {
          update: {
            password: hashNewPassword,
          },
        },
      },
    });

    res.status(200).json({ msg: "Password updated successfully", updatedPassword });
  } catch (error) {
    console.log("Error changing password:", error);
    res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// forgetPassword
export const forgetPassword = async (req,res)=>{
   try {
    const otp = Math.floor(1000 + Math.random() * 9000)
    console.log(otp);
    const {email} = req.body;
    if(!email) return res.status(400).json({msg:"Email is required"});
    const findUser = await prisma.user.findUnique({
      where:{email}
    })

    if(!findUser) return res.status(400).json({msg:"User doesn't exist"})

      // const resetToken = jwt.sign(
      //   { user: findUser.id },
      //   process.env.RESET_TOKEN_SECRET,
      //   { expiresIn: "1h" }
      // );
      // console.log(resetToken,"matchedUser");

      //nodemailer

      const updatedUserSecret = await prisma.userSecret.update({
        where:{userId:findUser.id},
        data:{
                otp:otp.toString(),
                expiresAt: expiresAt.toISOString(),
                used:false
        
        }
      })
      console.log(updatedUserSecret,"....")

      return res.status(200).json({msg:updatedUserSecret})
   } catch (error) {
    res.status(500).json({ msg: "Internal server error", error: error.message });
   }
}

// resetPassword
export const resetPassword =async(req,res)=>{
 const {userId}= req
 try {
 const  {password}=req.body
 const hashedPassword = await bcrypt.hash(password,10)

  const updatedPassword = await prisma.userSecret.update({
      where:{
        userId
      },
      data:{
        password:hashedPassword,
      }
  })
  return res.status(200).json({msg: updatedPassword})
 } 
  catch (error) {
    res.status(500).json({ msg: "Internal server error", error: error.message });
 } 
}