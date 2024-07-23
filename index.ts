import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { initDb } from "./app/services/initDB";
import bodyParser from "body-parser";
import * as http from "http";
import { IUser, UserRole } from "./app/schemas/User";
import authRoutes from "./app/routes/authRoutes";
import userRoutes from "./app/routes/userRoutes";
import adminRoutes from "./app/routes/adminRoutes";
import nodemailer from "nodemailer";
import { initPassport } from "./app/services/passport-jwt";
import { roleAuth } from "./app/middlewares/roleAuth";
import { File } from "./app/schemas/FileSchema";
import cors from "cors";
import errorHandler from "./app/middlewares/errorHandler";
import path from "path";

import apiKeyLimit from "./app/middlewares/apiKeyLimit";
import expressAsyncHandler from "express-async-handler";
const app: Express = express();
const router = express.Router;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const port = 5000;
dotenv.config();
declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    // interface IUser{}
    interface Request {
      user?: User;
      userId?: User;
    }
  }
}

const initApp = async (): Promise<void> => {
  initDb();
  initPassport();
  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });
  app.post('/api/send-pdf', async (req, res) => {
    const { pdf, email } = req.body;
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

      console.log("Dikttt Hogyiii............")
      console.error('Error sending email', error);
      res.status(500).send('Error sending email');
    }
  });
  app.use("/api", authRoutes);

  //to correct middle ware of roleAuth
  app.get(
    "/file/:id",
    expressAsyncHandler(async (req: Request, res: Response) => {
      const file = await File.findById(req.params.id);

      if (file) {
        console.log("file", file);
        res.download(file.filepath, file.filename);
      }
    })
  );
  //auth //protected routes
  //error in routes passing
  app.use("/api", roleAuth(UserRole.USER), userRoutes);
  app.use(
    "/api/admin",
    roleAuth(UserRole.ADMIN, ["/users", "/Plans"]),
    adminRoutes
  );
  app.use(errorHandler);
  http.createServer(app).listen(port, () => {
    console.log("server is running", port);
  });
};
initApp();
