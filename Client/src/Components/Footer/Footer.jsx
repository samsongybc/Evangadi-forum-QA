import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer-left">
          <div className="footer-logo">
            <span className="logo-orange">EV</span>
            <span className="logo-white">NGADI</span>
          </div>

          <div className="footer-socials">
            <a
              href="https://www.facebook.com/evangaditech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Evangadi on Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/evangaditech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Evangadi on Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@EvangadiTech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Evangadi on YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="https://twitter.com/evangaditech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Evangadi on Twitter"
            >
              <FaXTwitter />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Useful Link</h4>
          <a href="#">How it works</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy policy</a>
        </div>

        <div className="footer-contact">
          <h4>Contact Info</h4>
          <p>Evngadi Networks</p>
          <p>support@evngadi.com</p>
          <p>+1-202-386-2702</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
