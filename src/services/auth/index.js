const jwt = require("jsonwebtoken");
const UserModel = require("../../models/users");
const { APIError } = require("../../utils/index");

const authenticate = async (user) => {
  try {
    const accessToken = await generateJWT({ _id: user._id });
    const refreshToken = await generateRefreshJWT({ _id: user._id });
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    // return { token: newAccessToken, refreshToken: newRefreshToken };
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error);
  }
};

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 9 },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyJWT = (token) =>
  new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      console.log("decoded: ", decoded);
      if (err) rej(err);
      res(decoded);
    });
  });

const generateRefreshJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

const refreshToken = async (oldRefreshToken) => {
  const decoded = await verifyRefreshToken(oldRefreshToken);
  const user = await UserModel.findOne({ _id: decoded._id });
  if (!user) throw new APIError(`Access is forbidden`, 403);
  const currentRefreshToken = user.refreshTokens.find(
    (t) => t.token === oldRefreshToken
  );
  if (!currentRefreshToken) throw new APIError(`Refresh token is wrong`, 400);

  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefreshJWT({ _id: user._id });

  const newRefreshTokens = user.refreshTokens
    .filter((t) => t.token !== oldRefreshToken)
    .concat({ token: refreshToken });

  user.refreshTokens = [...newRefreshTokens];

  await user.save();

  return { accessToken, refreshToken };
};

module.exports = { authenticate, verifyJWT, refreshToken };
