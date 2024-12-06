import Router from 'express'
const router = Router();

import {register,login, verifyOtp, resendOtp, logOut ,refreshToken,changePassword,forgetPassword,resetPassword} from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js';


router.post('/register',register);
router.post('/login',login)
router.post('/verifyOtp',verifyJWT,verifyOtp);
router.put('/resendOtp',verifyJWT,resendOtp);
router.put('/logOut/:sessionId',verifyJWT,logOut);
router.post('/refreshToken',verifyJWT,refreshToken)
router.put('/changepassword',verifyJWT,changePassword)
router.post('/forgetPassword',verifyJWT,forgetPassword)
router.post('/forget',verifyJWT,resetPassword)


export default router