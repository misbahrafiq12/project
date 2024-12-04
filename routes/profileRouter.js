import Router from 'express'
const router = Router();

import {createProfile} from '../controllers/profileController.js'

router.post('/register',createProfile);


export default router