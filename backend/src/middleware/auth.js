import { verifyToken } from "../utils/jwt.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.token || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

  if (!token) {
    res.status(401);
    return next(new Error("Authentication token required."));
  }

  try {
    const decoded = verifyToken(token);
    let user = null;
    
    if (decoded.role === "patient") {
      user = await Patient.findById(decoded.id).select("-password");
    } else if (decoded.role === "doctor") {
      user = await Doctor.findById(decoded.id).select("-password");
    }

    if (!user) {
      res.status(401);
      return next(new Error("User not found."));
    }

    // Convert mongoose doc to plain object so we can attach role safely
    const userObj = user.toObject();
    userObj.role = decoded.role;

    req.user = userObj;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Invalid or expired token."));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden: Insufficient permissions."));
    }
    next();
  };
}
