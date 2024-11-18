import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const isAuth = async(req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Please Login",
            });
        }

        const decodedData = jwt.verify(token, process.env.Jwt_Sec);

        req.user = await User.findById(decodedData._id);

        if (!req.user) {
            return res.status(404).json({
                message: "User not found",
            });  
        }

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please login again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token, please login again' });
        }
        res.status(500).json({
            message: "An error occurred, please try again",
        });
    }
};

export const isAdmin = (req,res,next) =>{
    try{
        if(req.user.role !== "admin")
            return res.status(403).json({
        message: "You are not admin",
    });

    next();

    } catch (error){
        res.status(500).json({
            message: error.message,
        });
    }
}
