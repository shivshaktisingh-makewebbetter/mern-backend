// routes/user.js
const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

// POST check if product exists and create product
router.post("/create-product", async (req, res) => {
  const {
    product_name,
    product_description,
    product_price,
    product_category,
    product_stock,
  } = req.body;

  try {
    // Check if product already exists
    const product = await Product.findOne({ product_name });

    if (product) {
      // If product exists, return a 409 status (Conflict)
      return res.status(409).json({ message: "Product already exists" });
    }

    // Create a new category
    const newProduct = new Product({
      product_name,
      product_description,
      product_price,
      product_category,
      product_stock,
    });

    // Save the new category to the database
    await newProduct.save();

    // Send a success response after saving the category
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const product = await Product.find();
    res.status(201).json({ data: product, message: "Product Listing" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-product/:id", async (req, res) => {
  const { id } = req.params; // Extract product ID from URL parameters

  try {
    // Check if the category exists and delete it
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      // If category does not exist, return a 404 status (Not Found)
      return res.status(404).json({ message: "Product not found" });
    }

    // Send a success response after deleting the category
    res.status(201).json({ message: "Product deleted successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-product/:id", async (req, res) => {
  const { id } = req.params; // Extract category ID from URL parameters
  const {
    product_name,
    product_description,
    product_price,
    product_category,
    product_stock,
  } = req.body;

  try {
    // Check if the category exists
    const product = await Product.findById(id);
    if (!product) {
      // If category does not exist, return a 404 status (Not Found)
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the category with new data
    product.product_name = product_name;
    product.product_description = product_description;
    product.product_stock = product_stock;
    product.product_price = product_price;
    product.product_category = product_category;
    // Save the updated category to the database
    await product.save();

    // Send a success response after updating the category
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

router.post("/uploadcsv", upload.single("csvFile"), async (req, res) => {
  const results = [];

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      try {
        // Loop through the parsed data and save each row as a new category
        for (const row of results) {
          const {
            product_name,
            product_description,
            product_category,
            product_price,
            product_stock,
          } = row;

          if (
            !product_name.trim() ||
            !product_description.trim() ||
            !product_category.trim() ||
            !product_price ||
            !product_stock
          ) {
            return res.status(400).json({
              message:
                "CSV must contain 'product_name'  , 'product_description' and 'product_category'",
            });
          }

          // Check if product already exists
          const existingProduct = await Product.findOne({ product_name });
          if (existingProduct) {
            continue; // Skip this row if the product already exists
          }

          // Create and save the new product
          const newProduct = new Product({
            product_name,
            product_description,
            product_category,
            product_price,
            product_stock,
          });

          await newProduct.save();
        }

        // Send a success response after saving the categories
        res.status(201).json({
          message: "CSV data uploaded and products created successfully",
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      } finally {
        // Delete the uploaded CSV file after processing
        fs.unlinkSync(req.file.path);
      }
    })
    .on("error", (error) => {
      res.status(500).json({ message: "Error parsing the CSV file" });
    });
});

router.post("/uploadjson", upload.single("jsonFile"), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Read the uploaded JSON file
    const fileData = fs.readFileSync(req.file.path, "utf8");
    const categories = JSON.parse(fileData); // Parse JSON data

    // Validate that categories is an array
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        message: "Invalid JSON format. Expected an array of objects.",
      });
    }

    // Loop through the parsed data and save each category
    for (const row of categories) {
      const {
        product_name,
        product_description,
        product_category,
        product_price,
        product_stock,
      } = row;

      if (
        !product_name.trim() ||
        !product_description.trim() ||
        !product_category.trim() ||
        !product_price ||
        !product_stock
      ) {
        return res.status(400).json({
          message:
            "JSON must contain 'product_name'  , 'product_description' and 'product_category'",
        });
      }

      // Check if prodct already exists
      const existingProduct = await Product.findOne({ product_name });
      if (existingProduct) {
        continue; // Skip this row if the product already exists
      }

      // Create and save the new product
      const newProduct = new Product({
        product_name,
        product_description,
        product_category,
        product_price,
        product_stock,
      });

      await newProduct.save();
    }

    // Send a success response after saving the categories
    res.status(201).json({
      message: "JSON data uploaded and products created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing the JSON file" });
  } finally {
    // Delete the uploaded JSON file after processing
    fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
