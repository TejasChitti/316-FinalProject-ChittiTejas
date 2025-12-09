const auth = require("../auth");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");

const getLoggedIn = async (req, res) => {
  try {
    let userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
      });
    }

    const loggedInUser = await User.findOne({ _id: userId });
    if (!loggedInUser) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
      });
    }

    return res.status(200).json({
      loggedIn: true,
      user: {
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        email: loggedInUser.email,
        avatar: loggedInUser.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      loggedIn: false,
      user: null,
      errorMessage: "Server error",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordVerify, avatar } =
      req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !passwordVerify) {
      return res.status(400).json({
        success: false,
        errorMessage: "Please enter all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        errorMessage: "Password must be at least 8 characters long.",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        success: false,
        errorMessage: "Passwords do not match.",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash,
      avatar: avatar || "",
    });

    const savedUser = await newUser.save();

    // Create token
    const token = auth.signToken(savedUser._id, savedUser.email);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        user: {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          avatar: savedUser.avatar,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errorMessage: "Server error during registration.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorMessage: "Please enter all required fields.",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        errorMessage: "Wrong email or password.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        errorMessage: "Wrong email or password.",
      });
    }

    const token = auth.signToken(existingUser._id, existingUser.email);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        user: {
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          avatar: existingUser.avatar,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errorMessage: "Server error during login.",
    });
  }
};

const logoutUser = async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .status(200)
    .json({
      success: true,
    });
};

const updateUser = async (req, res) => {
  try {
    const userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        errorMessage: "Unauthorized",
      });
    }

    const { firstName, lastName, password, passwordVerify, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorMessage: "User not found",
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar) user.avatar = avatar;

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          errorMessage: "Password must be at least 8 characters long.",
        });
      }

      if (password !== passwordVerify) {
        return res.status(400).json({
          success: false,
          errorMessage: "Passwords do not match.",
        });
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errorMessage: "Server error during update.",
    });
  }
};

module.exports = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
};
