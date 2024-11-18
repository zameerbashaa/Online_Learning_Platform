import { User } from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";

// User Registration
export const register = TryCatch(async (req, res) => {
    const { email, name, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({ message: "User Already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = {
        name,
        email,
        password: hashPassword,
    };

    const otp = Math.floor(Math.random() * 100000);
    const activationToken = jwt.sign({ user, otp }, process.env.Activation_Secret, {
        expiresIn: "1d", // 1 day expiration for activation token
    });

    const data = {
        name,
        otp,
    };
    await sendMail(email, "E-learning OTP", data);

    res.status(200).json({
        message: "OTP sent to your email",
        activationToken,
    });
});

// Verify User Registration
export const verifyUser = TryCatch(async (req, res) => {
    const { otp, activationToken } = req.body;

    try {
        const verify = jwt.verify(activationToken, process.env.Activation_Secret);

        if (verify.otp !== otp) {
            return res.status(400).json({ message: "Wrong OTP" });
        }

        await User.create({
            name: verify.user.name,
            email: verify.user.email,
            password: verify.user.password,
        });

        res.json({ message: "User registered successfully" });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ message: "OTP expired, please request a new one" });
        }
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

// User Login
export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "No user with this email" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        return res.status(400).json({ message: "Wrong Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
        expiresIn: "15d", // Token valid for 15 days
    });

    res.json({
        message: `Welcome back ${user.name}`,
        token,
        user,
    });
});

// Fetch User Profile
export const myProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ user });
});

// Resend OTP
export const resendOtp = TryCatch(async (req, res) => {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(Math.random() * 100000);
    const activationToken = jwt.sign({ user: { name: user.name, email: user.email }, otp }, process.env.Activation_Secret, {
        expiresIn: "1d", // 1 day expiration for activation token
    });

    const data = { name: user.name, otp };
    await sendMail(email, "Resend OTP - E-learning Verification", data);

    res.status(200).json({
        message: "New OTP sent to your email",
        activationToken,
    });
});
