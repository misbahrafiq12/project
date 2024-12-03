//  import dotenv from "dotenv"
 
// dotenv.config()
 import prisma from "../DB/db.config.js";
 import bcrypt from "bcrypt"
 import jwt from 'jsonwebtoken'
 const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1)

// register
export const register = async(req,res)=>{
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
                    otp:"1234",
                    expiresAt: expiresAt.toISOString(),

                }
            } 

        },
        include:{
            userSecret:true
        }
    })
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
      
      
        // const modifieduser = UserLoginDTO(user)
        res.status(200).send(matchedUser)
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
      }
    };