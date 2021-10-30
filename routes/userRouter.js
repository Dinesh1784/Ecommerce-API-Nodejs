const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userList = await User.find().select("-passwordHash");
    res.status(200).send(userList);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    res.status(200).send(user);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 12),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      state: req.body.state,
      pincode: req.body.pincode,
      city: req.body.city,
      country: req.body.country,
    });
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 12),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      state: req.body.state,
      pincode: req.body.pincode,
      city: req.body.city,
      country: req.body.country,
    });
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "No user for that email",
      });
    }
    const comparePass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );
    if (!comparePass) {
      res.status(404).json({
        status: "fail",
        message: "password is wrong",
      });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE_IN,
      }
    );
    res.status(200).send({ user: user.email, token: token });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteUser = await User.findByIdAndRemove(req.params.id);
    if (!deleteUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user on that id",
      });
    }
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/get/count", async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        count: userCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});
module.exports = router;
