import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h3 className="about-title">About</h3>
      <h1 className="about-heading">Evangadi Networks</h1>
      <p className="about-text">
        No matter what stage of life you are in, whether you’re just starting
        elementary school or being promoted to CEO of a Fortune 500 company, you
        have much to offer to those who are trying to follow in your footsteps.
      </p>
      <p className="about-text">
        Whether you are willing to share your knowledge or you are just looking
        to meet mentors of your own, please start by joining the network here.
      </p>
      <button className="about-btn">HOW IT WORKS</button>
    </div>
  );
};

export default About;
