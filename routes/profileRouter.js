import Router from 'express'
const router = Router();
import { upload } from "../multer/multer.js";

import {createProfile} from '../controllers/profileController.js'
import verifyJWT from '../middleware/verifyJWT.js';

router.post('/createProfile',verifyJWT,upload.single('profileImage'),createProfile);


export default router