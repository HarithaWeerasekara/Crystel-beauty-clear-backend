import jwt from "jsonwebtoken";

export default function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, "random456", (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;
    next();
  });
}
