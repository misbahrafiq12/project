import Router from 'express'
const router = Router();
import userRouter from './userRouter.js'
import profileRouter from './profileRouter.js'

router.use('/user',userRouter);
router.use('/profile',profileRouter)

export default router