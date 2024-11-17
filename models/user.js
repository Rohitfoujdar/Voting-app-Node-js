// const { uniq } = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  mobileNumber: {
    type: String,
  },

  email: {
    type: String,
    unique: true,
  },

  adharCardNumber: {
    type: Number,
    unique: true,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  isVoted: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  // If role is admin, check if an admin already exists
  if (user.role === "admin") {
    const existingAdmin = await mongoose
      .model("userdb")
      .findOne({ role: "admin" });

    // If another admin exists and the current user is not updating their own role
    if (existingAdmin && existingAdmin._id.toString() !== user._id.toString()) {
      const error = new Error("An admin user already exists.");
      return next(error);
    }
  }
  if (!user.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

const user = mongoose.model("userdb", userSchema);
module.exports = user;
