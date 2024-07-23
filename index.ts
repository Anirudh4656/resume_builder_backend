import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { initDb } from "./app/services/initDB";
import bodyParser from "body-parser";
import nodemailer from "nodemailer"
import * as http from "http";
import { IUser, UserRole } from "./app/schemas/User";
import authRoutes from "./app/routes/authRoutes";
import resumeRoutes from "./app/routes/resumeRoutes"
import { initPassport } from "./app/services/passport-jwt";
import { roleAuth } from "./app/middlewares/roleAuth";
import cors from "cors";
import errorHandler from "./app/middlewares/errorHandler";
import multer from "multer";
import path from "path";
import { loadConfig } from "./app/config/config";

const app:Express = express();

app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json());


app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());

declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    interface Request {
      user?: User;
      userId?: User;
    }
  }
}








const initApp = async (): Promise<void> => {
  dotenv.config();
const port=process.env.PORT ||5000
  initDb();
  initPassport();

  app.post('/api/send-pdf', async (req, res) => {
    const { pdf,email } = req.body;
    console.log("Your Target Mail Is - " + email)
  
    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:587,
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
      },
    });
  
    const mailOptions = {
      // from: 'your-email@gmail.com',
      to: email,
      subject: 'Your Resume',
      text: 'Please find your resume attached.',
      attachments: [
        {
          filename: 'resume.pdf',
          content: pdf.split('base64,')[1],
          encoding: 'base64',
        },
      ],
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("PDF sent to the user via email")
      res.status(200).send('PDF sent to the user via email');
    } catch (error) {

    
      console.error('Error sending email', error);
      res.status(500).send('Error sending email');
    }
  });




  app.use("/api", authRoutes);
  app.use("/api", resumeRoutes);
 
  http.createServer(app).listen(port, () => {
    console.log("server is running", port);
  });
};
initApp();
