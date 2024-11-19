// routes/user.js
const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

// POST check if category exists and create category
router.post("/create-category", async (req, res) => {
  const { category_name, category_description } = req.body;

  try {
    // Check if category already exists
    const category = await Category.findOne({ category_name });

    if (category) {
      // If category exists, return a 409 status (Conflict)
      return res.status(409).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new Category({
      category_name,
      category_description,
    });

    // Save the new category to the database
    await newCategory.save();

    // Send a success response after saving the category
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const category = await Category.find();
    res.status(201).json({ data: category, message: "Category Listing" });
  } catch (error) {
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
          const { category_name, category_description } = row;

          if (!category_name.trim() || !category_description.trim()) {
            return res.status(400).json({
              message:
                "CSV must contain 'category_name' and 'category_description'",
            });
          }

          // Check if category already exists
          const existingCategory = await Category.findOne({ category_name });
          if (existingCategory) {
            continue; // Skip this row if the category already exists
          }

          // Create and save the new category
          const newCategory = new Category({
            category_name,
            category_description,
          });

          await newCategory.save();
        }

        // Send a success response after saving the categories
        res.status(201).json({
          message: "CSV data uploaded and categories created successfully",
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
      return res
        .status(400)
        .json({ message: "Invalid JSON format. Expected an array of objects." });
    }

    // Loop through the parsed data and save each category
    for (const row of categories) {
      const { category_name, category_description } = row;

      if (!category_name || !category_description) {
        return res.status(400).json({
          message:
            "JSON must contain 'category_name' and 'category_description' for each item.",
        });
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({ category_name });
      if (existingCategory) {
        continue; // Skip this row if the category already exists
      }

      // Create and save the new category
      const newCategory = new Category({
        category_name: category_name.trim(),
        category_description: category_description.trim(),
      });

      await newCategory.save();
    }

    // Send a success response after saving the categories
    res.status(201).json({
      message: "JSON data uploaded and categories created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing the JSON file" });
  } finally {
    // Delete the uploaded JSON file after processing
    fs.unlinkSync(req.file.path);
  }
});

router.put("/update-category/:id", async (req, res) => {
  const { id } = req.params; // Extract category ID from URL parameters
  const { category_name, category_description } = req.body; // Extract data from request body

  try {
    // Check if the category exists
    const category = await Category.findById(id);
    if (!category) {
      // If category does not exist, return a 404 status (Not Found)
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the category with new data
    category.category_name = category_name;
    category.category_description = category_description;

    // Save the updated category to the database
    await category.save();

    // Send a success response after updating the category
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-category/:id", async (req, res) => {
  const { id } = req.params; // Extract category ID from URL parameters

  try {
    // Check if the category exists and delete it
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      // If category does not exist, return a 404 status (Not Found)
      return res.status(404).json({ message: "Category not found" });
    }

    // Send a success response after deleting the category
    res.status(201).json({ message: "Category deleted successfully" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
