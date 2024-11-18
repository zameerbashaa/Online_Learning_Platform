import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { server } from "../main";
import toast, { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Login function
    async function loginUser(email, password, navigate, fetchMyCourse) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/user/login`, { email, password }); // Change to login endpoint

            toast.success(data.message);
            localStorage.setItem("token", data.token); // Store token in localStorage
            setUser(data.user);  // Set user data
            setIsAuth(true);     // Mark user as authenticated
            setBtnLoading(false);
            navigate("/");   
            fetchMyCourse(); // Navigate to home after login
        } catch (error) {
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(error.response?.data?.message || "An error occurred");  // Handle errors
        }
    }

    async function registerUser(name, email, password, navigate) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/user/register`, { 
                name,
                email, 
                password, 
            });

            toast.success(data.message);
            localStorage.setItem("activationToken", data.activationToken); // Store token in localStorage
            setBtnLoading(false);
            navigate("/verify"); // Navigate to OTP verification page
        } catch (error) {
            setBtnLoading(false);
            toast.error(error.response?.data?.message || "An error occurred");  // Handle errors
        }
    }

    async function verifyOtp(otp, navigate) { // Added navigate parameter to function
        setBtnLoading(true);
        const activationToken = localStorage.getItem("activationToken");
        try {
            const { data } = await axios.post(`${server}/api/user/verify`, {
                otp,
                activationToken,
            });

            toast.success(data.message);
            navigate('/login'); // Navigate to login after successful verification
            localStorage.clear(); 
            setBtnLoading(false);
        } catch (error) {
            setBtnLoading(false);
            toast.error(error.response?.data?.message || "An error occurred"); // Handle errors
        }
    }

    // Fetch user data function
    async function fetchUser() {
        const token = localStorage.getItem("token");  // Retrieve token from localStorage
        if (!token) {
            setLoading(false);  // If no token, stop loading
            return;
        }

        try {
            const { data } = await axios.get(`${server}/api/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setIsAuth(true);    // Mark user as authenticated
            setUser(data.user); // Set fetched user data
            setLoading(false);  // Loading finished
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                setIsAuth(false); // Unauthorized, user is not authenticated
                localStorage.removeItem("token"); // Remove token
                toast.error("Session expired, please log in again.");
            }
            setLoading(false);   // Loading finished
        }
    }

    // Fetch user data on component mount
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                setIsAuth,
                isAuth,
                loginUser,
                btnLoading,
                loading,
                registerUser,
                verifyOtp,
                fetchUser,
            }}
        >
            {children}
            <Toaster />
        </UserContext.Provider>
    );
};

// Custom hook to use UserContext
export const UserData = () => useContext(UserContext);
