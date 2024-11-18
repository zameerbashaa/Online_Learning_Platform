import React from 'react'
import './footer.css'
import { AiFillFacebook } from "react-icons/ai";
import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";

const Footer = () => {
  return (
    <footer>
        <div className="footer-content">
            <p>
                &copy; 2024 Your E-Learning Platform. All rights reserved.<br />
                
            </p>
            <div className="social-links">
                <a href=" "><AiFillFacebook /></a>
                <a href=" "><RiTwitterXLine /></a>
                <a href=" "><IoLogoInstagram /> </a>
            </div>
        </div>
    </footer>
  )
}

export default Footer
