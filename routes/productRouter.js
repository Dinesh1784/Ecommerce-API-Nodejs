const express = require("express");
const Category = require("../models/category");
const Product = require("../models/product");
const router = express.Router();
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    const product = await Product.find(filter);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    res.status(200).send(product);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.post("/", uploadOptions.single("image"), async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid category id",
      });
    }
    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const newProduct = await Product.create({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    res.status(201).send(newProduct);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid category id",
      });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send("Invalid Product!");

    const file = req.file;
    let imagepath;

    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    } else {
      imagepath = product.image;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
        new: true,
      }
    );
    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "product cannot be updated",
      });
    }

    res.status(200).send(updated);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteProduct = await Product.findByIdAndRemove(req.params.id);
    if (!deleteProduct) {
      return res.status(404).json({
        status: "fail",
        message: "No product on that id",
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
    const productCount = await Product.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        count: productCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/get/featured", async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeature: true });
    res.status(200).send(featured);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});
router.get("/get/featured/:count", async (req, res, next) => {
  try {
    const count = req.params.count * 1 || 0;
    const featured = await Product.find({ isFeature: true }).limit(count);
    res.status(200).send(featured);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.patch(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  }
);

module.exports = router;
