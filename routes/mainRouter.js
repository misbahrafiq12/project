import Router from 'express'
const router = Router();
import userRouter from './userRouter.js'

router.use('/user',userRouter);
router.use('/profile',userRouter)

export default router