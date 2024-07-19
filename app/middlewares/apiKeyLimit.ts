import { Request, Response, NextFunction } from "express";
import { User, type IUser } from "../schemas/User";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
const apiKeyLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = req.user;

    if (!result) {
      throw createHttpError(401, { message: "Unauthorized" });
    }

    const userDetails = await User.findById(result.id).populate({
      path: "plan",
    });

    if (!userDetails) {
      throw createHttpError(401, { message: "No details Found" });
    }
    // If planDetails not found
    if (userDetails.plan.length === 0) {
      return next(createHttpError(404, { message: "No plan available." }));
    }

    console.log("in userDetils", userDetails);
    //
    const apiRequestperSecond = userDetails?.plan[0].apiLimit;

    const limiter = rateLimit({
      windowMs: 1000, //1sec
      max: apiRequestperSecond, // limit each IP to 5 requests per windowMs
      message:
        "Too many requests from this IP, please try again after a second",
      headers: true,
      handler: (req, res, next, options) => {
        return next(
          createHttpError(options.statusCode, { message: options.message })
        );
      },
    });
    limiter(req, res, async (err) => {
      if (err) {
        next(
          createHttpError(500, { message: "Please try again after some time" })
        );
        next(err);
      }
    });

    if (!userDetails.apiKey) {
      return next(createHttpError(404, { message: "API key is missing." }));
    }
    if (userDetails.apiUsage >= userDetails.plan[0].apiLimit) {
      return next(
        createHttpError(429, { message: "API Usage limit exceeded." })
      );
    }
    console.log("in userDetils", userDetails);

    if (
      userDetails &&
      result.storageUsage >=
        userDetails?.plan[0].storageLimit * 1024 * 1024 * 1024
    ) {
      throw createHttpError(404, { message: "Memory limit exceeded." });
    }
    userDetails.apiUsage += 1;
    await userDetails.save();

    next();
  } catch (error: any) {
    next(createHttpError(500, { message: error.message }));
  }
};

export default apiKeyLimit;
