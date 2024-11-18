// routes/user.js
import express from "express";
import { loginUser, myProfile, register } from "../controllers/user.js"; // Correctly import the register function
import { verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Use the imported register function in the route
router.post('/user/register', register);
router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile)

export default router;
