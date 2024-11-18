import React, { useState } from 'react';
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from '../../context/UserContext';

const Verify = () => {
  const [otp, setOtp] = useState("");
  const { btnLoading, verifyOtp, resendOtp } = UserData();
  const navigate = useNavigate();
  const [otpExpired, setOtpExpired] = useState(false); // To track if OTP expired

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(Number(otp), navigate);
    } catch (error) {
      if (error.response?.data?.message === "jwt expired") {
        setOtpExpired(true); // OTP expired, show resend option
      }
    }
  };

  const resendOtpHandler = async () => {
    const email = localStorage.getItem("email"); // Get the user's email from local storage
    await resendOtp(email); // Call resendOtp function from UserContext
    setOtpExpired(false); // Reset the expired state after resending OTP
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify Account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="otp">OTP</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Please Wait..." : "Verify"}
          </button>
        </form>
        {otpExpired && (
          <div className="error-message">
            <p>OTP has expired. <button onClick={resendOtpHandler}>Resend OTP</button></p>
          </div>
        )}
        <p>
          Go to <Link to='/login'>Login</Link> page
        </p>
      </div>
    </div>
  );
};

export default Verify;
