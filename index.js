import express from 'express'
// import sgMail from '@sendgrid/mail';
const app = express();
import router from './routes/mainRouter.js'
import cors from "cors"
import dotenv from 'dotenv'


dotenv.config()
app.use(express.json())
app.use(cors())
app.get('/',(req,res)=>{
    res.send("heelo")
})


// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'test@yopmail.com',
//   from: 'misbahrafiq95@gmail.com',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };

// sgMail
//   .send(msg)
//   .then(() => {}, error => {
//     console.error(error);

//     if (error.response) {
//       console.error(error.response.body)
//     }
//   });
app.use(router)

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server listen PORT on ${PORT}`)
})