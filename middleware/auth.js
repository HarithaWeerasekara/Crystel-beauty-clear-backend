import jwt from "jsonwebtoken";

export default function verifyJWT(req, res, next) {
  const header = req.header("Authorization");

  if (header && header.startsWith("Bearer ")) {
    const token = header.replace("Bearer ", "");

    jwt.verify(token, "random456", (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded;
      }
      next();
    });
  } else {
    next();
  }
}
