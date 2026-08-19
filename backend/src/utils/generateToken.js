import jwt from "jsonwebtoken";

// Full access token — issued only AFTER OTP has been verified.
export function generateToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Short-lived token issued right after password verification.
// It only proves "this person knows the password" — it is NOT a login
// session and cannot be used to call protected routes. It's exchanged
// for a real access token only once the correct OTP is supplied.
export function generatePendingToken(userId) {
  return jwt.sign({ id: userId, type: "otp_pending" }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
}
