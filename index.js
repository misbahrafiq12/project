import express from 'express'

// import sgMail from '@sendgrid/mail';
const app = express();
import router from './routes/mainRouter.js'
import cors from "cors"
import dotenv from 'dotenv'
app.use('/uploads', express.static('uploads'));

dotenv.config()
app.use(express.json())
app.use(cors())
app.get('/',(req,res)=>{
    res.send("heelo")
})


// Error handling middleware for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    next();
  });
app.use(router)

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server listen PORT on ${PORT}`)
})