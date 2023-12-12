import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Box, Image, Center, Spinner, VStack, Fade } from "@chakra-ui/react";
import { SendDemoRequestEmail } from "../../../apollo/landingPageQueries";
import { useAlert } from "../../components/alert/alertContext";
import { ROUTE_PATHS } from "../../../constants";

const mainLogo = require("../../../assets/mainLogoBlack.png");

export default function Home() {
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [sendEmail, sendEmailResponse] = useMutation(SendDemoRequestEmail);
  const iframeRef = useRef(null);

  // Handler to change loading state when iframe content is loaded
  const handleIFrameLoad = () => {
    setLoading(false);
  };

  const scrollToContactSection = () => {
    const iframeDoc = iframeRef.current.contentWindow.document;
    const element = iframeDoc.getElementById("Contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    // Access the iframe's document
    const iframeDoc = iframeRef.current.contentWindow.document;

    // Find the Login / Register button
    let node = iframeDoc.querySelector("nav[role='navigation'] a[href='#']");
    if (node) {
      //@ts-ignore
      node.onclick = (e) => {
        // navigate to the sign in page when the button is clicked
        navigate(ROUTE_PATHS.SIGN_IN);
      };
    }

    // Link all email forms to the primary contact section at the bottom
    const forms = Array.from(iframeDoc.querySelectorAll("#email-form"));
    for (const form of forms) {
      let [input, button] = form;

      //@ts-ignore
      button.type = null;

      //@ts-ignore
      button.onclick = (e) => {
        const email: string = input.value || "";
        const node = iframeDoc.querySelector(
          "#wf-form-Contact-Form input[name='Email']"
        );
        node.value = email;
        scrollToContactSection();
      };
    }

    // lookup the contact form
    const contactSubmitButton = iframeDoc.querySelector(
      "#wf-form-Contact-Form input[type='submit'"
    );

    // revampt the contact form so that we control the form submission
    if (contactSubmitButton) {
      delete contactSubmitButton.type;
      //@ts-ignore
      contactSubmitButton.onclick = (e) => {
        e.preventDefault();
        addAlert({
          message: "Sending Email...",
          options: {
            status: "info",
          },
        });
        const [name, email, message] = Array.from(
          iframeDoc.querySelectorAll("#wf-form-Contact-Form .w-input")
        );
        sendEmail({
          variables: {
            subject: `Demo Request - ${email.value}`,
            content: `
            Recived a message: 
            Name: ${name.value},
            Email: ${email.value}
            Mesage: 
            ${message.value}
            `,
          },
          onCompleted: (response) => {
            addAlert({
              message: "Email Sent Successfully",
              options: {
                status: "success",
              },
            });

            const fields = Array.from(
              iframeDoc.querySelectorAll("#wf-form-Contact-Form .w-input")
            );
            for (const field of fields) {
              field.value = "";
            }
          },
          onError: (response) => {
            console.log("ERROR: ", response);
            addAlert({
              message: "There was a problem senging the email",
              options: {
                status: "error",
              },
            });
          },
        });
      };
    }
  }, [loading]);

  return (
    <>
      {loading && (
        <Center
          h='100vh'
          position='fixed'
          top='0'
          left='0'
          width='100vw'
          zIndex='1000'
          backgroundColor='rgba(255,255,255,0.9)'
        >
          <VStack>
            <Image src={mainLogo} />
            <Spinner
              ml='3'
              thickness='4px'
              speed='1.0s'
              emptyColor='gray.200'
              color='blue.500'
              size='lg'
            />
          </VStack>
        </Center>
      )}

      <Fade in={!loading}>
        <Box width='100vw' height='100vh' overflow='hidden'>
          <iframe
            ref={iframeRef}
            src='/static/landingpage/index.html'
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              overflow: "hidden",
            }}
            onLoad={handleIFrameLoad}
            title='Landing Page'
          />
        </Box>
      </Fade>
    </>
  );
}
