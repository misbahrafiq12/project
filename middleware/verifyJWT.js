import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import prisma from "../DB/db.config.js";

dotenv.config()

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({message:"unauthorize user"});
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log("this is err", err);
      return res.status(403).json({message:"User token is not match"});
    }
    const found = await prisma.user.findFirst({
      where: {
        id: decoded.user,
      },
    });
    if (found) {
      req.userId = decoded.user;
      next();
    } else {
      return res.status(404).json({message:"user is not found"});
    }
  });
};
export default verifyJWT;