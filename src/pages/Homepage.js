import React, { useState, useEffect } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import "./styles/Homepage.css";
import logo from "../components/images/logo.jpg";
import bg from "../components/images/bg.jpg";
import hod from "../components/images/mentors/hod.jpg";
import rp from "../components/images/mentors/rp.jpg";
import sk from "../components/images/mentors/sk.jpg";
import ks from "../components/images/mentors/ks.jpg";
import airtable from "../components/images/mentors/airtable.svg";
import vercel from "../components/images/mentors/vercel.png";
import jaya from "../components/images/team/jaya.jpg";
import anni from "../components/images/team/anni.jpg";
import tapa from "../components/images/team/tapa.jpg";
import promit from "../components/images/team/promit.jpg";

const Homepage = ({ airtableCredentials }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({});
  const [userPassword, setUserPassword] = useState("");
  const [isUserConfirmed, setIsUserConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetFormFields = () => {
    setSubmissionData({
      name: "",
      studentCode: "",
      projectTitle: "",
      projecturl: "",
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      studentCode: e.target.studentCode.value,
      projectTitle: e.target.projectTitle.value,
      projecturl: e.target.projecturl.value,
    };

    if (!isValidUrl(data.projecturl)) {
      alert("Please enter a valid URL.");
      return;
    }

    setSubmissionData(data);
    setShowModal(true);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    const isValid = isValidUrl(url);

    // Set state and indicate if URL is valid or not
    setSubmissionData({
      ...submissionData,
      projecturl: url,
      isUrlValid: isValid,
    });
  };

  const handleRegisteredUser = async () => {
    setIsLoading(true);
    const email = transformStudentCodeToEmail(submissionData.studentCode);
    if (email) {
      const userExists = await checkIfUserExists(email, airtableCredentials);
      if (userExists) {
        setIsUserConfirmed(true);
      } else {
        alert("You are not registered. Please register first.");
        setShowModal(false); // Close the modal
      }
    } else {
      alert("Invalid student code.");
      setShowModal(false); // Close the modal
    }
    setIsLoading(false);
  };

  const transformStudentCodeToEmail = (studentCode) => {
    const parts = studentCode.split("/");
    if (parts.length === 4 && parts[0] === "BWU") {
      const email = `bwu${parts[1]}${parts[2]}${parts[3]}@brainwareuniversity.ac.in`;
      return email.toLowerCase();
    }
    return null;
  };

  const checkIfUserExists = async (email, airtableCredentials) => {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblF5La1RkLC3gXsi`,
        {
          params: {
            filterByFormula: `AND({email} = '${email}')`,
          },
          headers: {
            Authorization: `Bearer ${airtableCredentials.apiKey}`,
          },
        }
      );
      return response.data.records.length > 0;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  const verifyPassword = async (email, password, airtableCredentials) => {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblF5La1RkLC3gXsi`,
        {
          params: {
            filterByFormula: `{email} = "${email}"`,
          },
          headers: {
            Authorization: `Bearer ${airtableCredentials.apiKey}`,
          },
        }
      );

      const user = response.data.records[0];
      if (user) {
        return bcrypt.compare(password, user.fields.password);
      }
      return false;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  };

  const submitProjectData = async (data, airtableCredentials) => {
    const requestData = {
      fields: {
        name: data.name,
        studentCode: data.studentCode,
        projectTitle: data.projectTitle,
        projectURL: data.projecturl,
        email: transformStudentCodeToEmail(data.studentCode),
      },
    };

    try {
      await axios.post(
        `https://api.airtable.com/v0/${airtableCredentials.baseId}/tbl2jhuQaDCmrr7Cw`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${airtableCredentials.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      // alert('Project submitted successfully!');
    } catch (error) {
      console.error("Error submitting project data:", error);
      alert("Failed to submit project.");
    }
  };

  // Function to verify the password and submit the project
  const handleProjectSubmission = async () => {
    setIsLoading(true);
    const email = transformStudentCodeToEmail(submissionData.studentCode);
    if (email) {
      const isPasswordCorrect = await verifyPassword(
        email,
        userPassword,
        airtableCredentials
      );
      if (isPasswordCorrect) {
        // Submit the project data
        try {
          await submitProjectData(submissionData, airtableCredentials);
          alert("Project submitted successfully!");
          resetFormFields();
          setShowModal(false);
          setIsUserConfirmed(false);
          setUserPassword("");
        } catch (error) {
          console.error("Error submitting project data:", error);
          alert("Failed to submit project.");
        }
      } else {
        alert("Incorrect password. Cannot submit project.");
      }
    } else {
      alert("Invalid student code.");
    }
    setIsLoading(false);
  };

  // Function to handle new user & redirect to registration form with pre-filled data
  const handleNewUser = () => {
    navigate("/register", { state: { prefilledData: submissionData } });
    setShowModal(false);
  };

  const capitalizeInput = (e) => {
    const value = e.target.value.toUpperCase();
    setSubmissionData({ ...submissionData, [e.target.name]: value });
  };

  const isValidUrl = (url) => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return urlRegex.test(url);
  };

  useEffect(() => {
    document.body.classList.add("homepage");
    return () => {
      document.body.classList.remove("homepage");
    };
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="container">
      <header className="header">
        <nav>
          <div className="brand">
            <img src={logo} alt="logo" />
            <h2>Computer Science & Engineering</h2>
          </div>
          <button className="menu-button" onClick={toggleMenu}>
            ☰
          </button>
          <ul className={`nav-links ${menuOpen ? "show" : ""}`}>
            <li className="nav-item">
              <a href="/competition">Compete</a>
            </li>
            <li className="nav-item">
              <a href="/contact-us">Contact Us</a>
            </li>
          </ul>
        </nav>
      </header>

      <section className="intro">
        {/* <h1 className="intro-heading">#CodeSmarter <i className="fas fa-code"></i></h1> */}
        <div className="intro-content">
          <div className="intro-image">
            <img src={bg} alt="coding image" />
          </div>
          <div className="intro-text">
            <p>
              <strong>
                Why settle for ordinary when you can be extraordinary?
              </strong>
              <br />
              At Brainware University, we're not just about textbooks and
              lectures.
              <br />
              We're about igniting your passion for learning and helping you
              turn it into real-world skills.
              <br />
              From coding challenges to robotics showdowns, we offer endless
              avenues for hands-on learning.
              <br />
              <br />
              Ready to take the next step?
              <br />
              <br />
              <strong></strong>
            </p>
            <a href="/login" class="button-link">
              <button class="btn">
                <span class="text">Explore</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <div className="sections-container">
        <section className="tech-stack">
          <h1>Our Technology Stack</h1>
          <div className="tech-icons">
            <div>
              <i className="fab fa-react fa-3x"></i>
              <h2>React</h2>
              <p>A JavaScript library for building user interfaces</p>
            </div>
            <div>
              <img
                src={airtable}
                alt="Airtable"
                style={{ width: "3rem", height: "3rem" }}
              />
              <h2>Airtable</h2>
              <p>Spreadsheet-like database for apps</p>
            </div>
            <div>
              <img
                src={vercel}
                alt="Vercel"
                style={{ width: "3rem", height: "3rem" }}
              />
              <h2>Vercel</h2>
              <p>Cloud platform for static sites and Serverless Functions</p>
            </div>
            <div>
              <i className="fab fa-node-js fa-3x"></i>
              <h2>Node.js</h2>
              <p>JavaScript runtime built on Chrome's V8 engine</p>
            </div>
          </div>
        </section>

        <section className="domains">
          <h1>Our Domains</h1>
          <div className="domain-images">
            <div>
              <i className="fas fa-laptop-code fa-3x"></i>
              <h2>Web Development</h2>
              <p>Build and deploy websites and web apps</p>
            </div>
            <div>
              <i className="fas fa-mobile-alt fa-3x"></i>
              <h2>App Development</h2>
              <p>Create mobile applications for Android and iOS</p>
            </div>
            <div>
              <i className="fas fa-flask fa-3x"></i>
              <h2>Research Project</h2>
              <p>Conduct research and develop prototypes</p>
            </div>
            <div>
              <i className="fas fa-project-diagram fa-3x"></i>
              <h2>Any Other</h2>
              <p>For projects that don't fit into the above categories</p>
            </div>
          </div>
        </section>
      </div>

      <section className="about">
        <h1>About Us</h1>
        <div className="about-wrapper">
          <p className="about-content">
            Department of Computer Science & Engineering aims to create a
            promising environment for producing skillful professionals by making
            students aware of the modern industrial need. The Department will
            also encourage fundamental and innovative research in the field of
            Computer Science & Engineering. <br></br>
            <br></br>It provides adequate guidance to students on emerging
            trends in the field of Computer Science & Engineering. It provides
            various opportunities for students to excel in every field by its
            collaboration with international bodies. Btech in Computer Science
            students are exposed to intensive pre-placement training sessions,
            including masterclasses with top company HRs, industry experts, soft
            skill training, aptitude grooming and choice-based industry-specific
            skill training. Therefore Brainware students make for an excellent
            talent pool.
          </p>
          {/* <div className='about-image'><img src={bg} alt="bg" /></div> */}
        </div>

        <a
          href="https://www.brainwareuniversity.ac.in/computer-science-engineering.php"
          class="cta"
          target="_blank"
        >
          <button class="learn-more">
            <span class="circle" aria-hidden="true">
              <span class="icon arrow"></span>
            </span>
            <span class="button-text">Learn More</span>
          </button>
        </a>
      </section>

      <section className="mentors">
        <h1 className="mentors-heading">Head and Mentors</h1>
        <p className="mentors-content">
          Our mentors are the guiding stars of our journey, providing us with
          the wisdom and insights we needed to bring this platform to life.{" "}
          <br />
        </p>

        <div className="mentor-images">
          <div className="mentor">
            <img src={hod} alt="Head of Department" />
            <strong>Dr. Shivnath Ghosh</strong>
          </div>
          <div className="mentor">
            <img src={rp} alt="Mentor RP" />
            <strong>Mr. Ritesh Prasad</strong>
          </div>
          <div className="mentor">
            <img src={sk} alt="Mentor SK" />
            <strong>Mr. Sitikantha Chattopadhyay</strong>
          </div>
          <div className="mentor">
            <img src={ks} alt="Mentor KS" />
            <strong>Mr. Kaustav Roy</strong>
          </div>
        </div>
      </section>

      <div className="highlight-container">
        <section className="highlights">
          <h1 className="highlights-heading">Feature your Project</h1>
          <p>Submit your project to get featured on our website!</p>
          <div className="highlight-form-box">
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={submissionData.name}
                onChange={capitalizeInput}
                required
              />
              <input
                type="text"
                id="studentCode"
                name="studentCode"
                placeholder="Student code (BWU/XXX/XX/XXX)"
                value={submissionData.studentCode}
                onChange={capitalizeInput}
                required
              />
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                placeholder="Project Title"
                value={submissionData.projectTitle}
                onChange={(e) =>
                  setSubmissionData({
                    ...submissionData,
                    projectTitle: e.target.value,
                  })
                }
                required
              />
              <input
                type="text"
                id="projecturl"
                name="projecturl"
                placeholder="Project URL"
                value={submissionData.projecturl}
                onChange={handleUrlChange}
                className={
                  submissionData.isUrlValid ? "valid-url" : "invalid-url"
                }
                required
              />
              {!submissionData.isUrlValid && (
                <p className="error-message">Please enter a valid URL.</p>
              )}
              <button type="submit" className="submit-button">
                <span>Submit</span>
              </button>
            </form>
          </div>
        </section>
      </div>

      {showModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => {
              setShowModal(false);
              setIsUserConfirmed(false);
              setUserPassword("");
            }}
          ></div>
          <div className="modal">
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : isUserConfirmed ? (
              <>
                <p>Please enter your password to submit the project:</p>
                <input
                  type="password"
                  placeholder="Password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
                <button onClick={handleProjectSubmission}>Submit</button>
              </>
            ) : (
              <>
                <p>Are you already registered?</p>
                <button onClick={handleRegisteredUser}>Yes</button>
                <button onClick={handleNewUser}>No</button>
              </>
            )}
          </div>
        </>
      )}

      <section className="team-members">
        <h1 className="team-heading">Meet Our Team</h1>
        <div className="team-content">
          <div className="team-member">
            <img src={promit} alt="Promit Saha" width="150" height="150" />
            <h3>Promit Saha</h3>
            <div class="social-icons">
              <a href="https://twitter.com/99promitsaha" target="_blank">
                <i class="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/99promitsaha/"
                target="_blank"
              >
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="team-member">
            <img src={jaya} alt="Jayashri Dey" width="150" height="150" />
            <h3>Jayashri Dey</h3>
            <div class="social-icons">
              {/* <a href="#" target="_blank"><i class="fab fa-twitter"></i></a> */}
              <a
                href="https://www.linkedin.com/in/jayashri-dey-41ba7121a"
                target="_blank"
              >
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="team-member">
            <img src={anni} alt="Aniket Pal" width="150" height="150" />
            <h3>Aniket Pal</h3>
            <div class="social-icons">
              {/* <a href="#" target="_blank"><i class="fab fa-twitter"></i></a> */}
              <a
                href="https://www.linkedin.com/in/aniket-pal-24820b202"
                target="_blank"
              >
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="team-member">
            <img src={tapa} alt="Tapasya Baidya" width="150" height="150" />
            <h3>Tapasya Baidya</h3>
            <div class="social-icons">
              <a href="https://twitter.com/0KnownStranger0" target="_blank">
                <i class="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/tapasya-baidya/"
                target="_blank"
              >
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logo} alt="Brainware University" />
            <span>Brainware University</span>
          </div>
          <div className="footer-info">
            <p>
              &copy; Developed by <strong>CodeSmarters</strong>. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
