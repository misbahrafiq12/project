import Router from 'express'
const router = Router();

import {register,login, verifyOtp, resendOtp, logOut ,refreshToken} from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js';


router.post('/register',register);
router.post('/login',login)
router.post('/verifyOtp',verifyJWT,verifyOtp);
router.put('/resendOtp',verifyJWT,resendOtp);
router.put('/logOut/:sessionId',verifyJWT,logOut);
router.post('refreshToken',refreshToken)

export default router