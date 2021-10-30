const express = require("express");
const Category = require("../models/category");
const createError = require("http-errors");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const categoryList = await Category.find();
  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(createError(404, "Invalid Category ID", { name: "error" }));
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(
        createError(404, "No Category on that id", { name: "error" })
      );
    }
    res.status(200).send(category);
  } catch (error) {
    next(createError(404, error));
  }
});

router.post("/", async (req, res, next) => {
  const category = await Category.create({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  if (!category) {
    return res.status(404).json({
      status: "fail",
      message: "The category cannot be created",
    });
  }
  res.status(201).send(category);
});

router.patch("/:id", async (req, res, next) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) {
    return res.status(404).json({
      status: "fail",
      message: "No category on that id",
    });
  }
  res.status(200).send(updated);
});

router.delete("/:id", async (req, res, next) => {
  const deleteCat = await Category.findByIdAndRemove(req.params.id);
  if (!deleteCat) {
    return res.status(404).json({
      status: "fail",
      message: "No category on that id",
    });
  }
  res.status(204).json({
    status: "success",
  });
});

router.get("/get/count", async (req, res, next) => {
  try {
    const categoryCount = await Category.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        count: categoryCount,
      },
    });
  } catch (error) {
    next(createError(404, error.message));
  }
});

module.exports = router;
