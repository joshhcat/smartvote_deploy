import axios from "axios";

// Replace this with your actual NODE_MAILER_ROUTE

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    const response = await axios.post(
      "http://localhost:3004/smart-vote/send-email",
      {
        to,
        subject,
        text,
        html,
      }
    );
    // You can log the response or handle success here
    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
