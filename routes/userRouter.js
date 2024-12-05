import Router from 'express'
const router = Router();

import {register,login, verifyOtp, resendOtp, logOut ,refreshToken,changePassword,forgetPassword} from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js';


router.post('/register',register);
router.post('/login',login)
router.post('/verifyOtp',verifyJWT,verifyOtp);
router.put('/resendOtp',verifyJWT,resendOtp);
router.put('/logOut/:sessionId',verifyJWT,logOut);
router.post('/refreshToken',verifyJWT,refreshToken)
router.put('/changepassword',verifyJWT,changePassword)
router.post('/forgetPassword',forgetPassword)

export default router