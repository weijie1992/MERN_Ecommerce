import React from "react";
import Logo from "../Images/FF.png";
import { MDBCol, MDBContainer, MDBRow, MDBFooter } from "mdbreact";

const Footer = () => {
  return (
    <MDBFooter
      style={{ backgroundColor: "#f3fabb" }}
      className="font-small pt-4 mt-4"
    >
      <MDBContainer fluid className="text-center text-md-left">
        <MDBRow>
          <MDBCol md="6">
            <img
              src={Logo}
              alt="MumsCookyLogo"
              style={{ height: "60px", objectFit: "cover" }}
            />
            <p
              className="mt-2"
              style={{
                color: "grey",
                fontStyle: "italic",
                fontWeight: "light",
              }}
            >
              Just health benefit foods
            </p>
          </MDBCol>
          <MDBCol md="6">
            <h5 className="title">About Me</h5>
            <ul>
              <li className="list-unstyled">
                <a
                  href="https://www.linkedin.com/in/phuaweijie/"
                  style={{
                    color: "grey",
                    fontStyle: "italic",
                    fontWeight: "light",
                  }}
                >
                  LinkenIn
                </a>
              </li>
              <li className="list-unstyled">
                <a
                  href="https://github.com/weijie1992"
                  style={{
                    color: "grey",
                    fontStyle: "italic",
                    fontWeight: "light",
                  }}
                >
                  Github
                </a>
              </li>
            </ul>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {/* <div className="footer-copyright text-center py-3">
      <MDBContainer fluid>
        &copy; {new Date().getFullYear()} Copyright: <a href="https://www.mdbootstrap.com"> MDBootstrap.com </a>
      </MDBContainer>
    </div> */}
    </MDBFooter>
  );
};

export default Footer;
