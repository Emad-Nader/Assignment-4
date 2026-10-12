// part 3

const express = require('express');
const app = express();

app.use(express.json());

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: "",
    database: "retail_store",
    port: 3306
});

//  Add a Category column to the Products table.
    app.put('/AddCategory', async (req, res) => {
        try{
            await pool.query(`ALTER TABLE Products
                ADD COLUMN Category VARCHAR(50) DEFAULT NULL`);
            return res.status(200).json({
                Message: "Category Added Successfully"
            })
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                return res.status(409).json({
                    Message: "Category column already exists"
                });
            }
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })




// Remove the Category column.
    app.delete('/DeleteCategory', async (req, res) => {
       try {
            await pool.query(`ALTER TABLE Products DROP COLUMN Category`);
            return res.status(200).json({
                Message: "Category Deleted Successfully"
            })
            } catch (err) {
                if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                    return res.status(404).json({
                    Message: "Category column does not exist"
                });
                    console.log(err);
                    return res.status(500).json({
                        Message: "Internal server error"
                    });
            }
       }

    })



//Change ContactNumber to VARCHAR(15).
    app.put('/UpdateContactNumber', async (req, res) => {
        try{
            await pool.query(`ALTER TABLE Suppliers MODIFY COLUMN S_ContactNumber VARCHAR(15)`);
            return res.status(200).json({
                Message: "Contact Number Updated Successfully"
            })
        }catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(404).json({
                    Message: "Contact number column not found"
                });
            }
            if (err.code === 'WARN_DATA_TRUNCATED' ||
                err.code === 'ER_DATA_TOO_LONG') {
                return res.status(400).json({
                    Message: "Some contact numbers exceed 15 characters"
                });
            }
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })



//Add a NOT NULL constraint to ProductName.
    app.put('/UpdateProductName', async (req, res) => {
        try{
            await pool.query(`ALTER TABLE Products MODIFY COLUMN P_Name VARCHAR(100) NOT NULL`);
            return res.status(200).json({
                Message: "Product Name Updated Successfully"
            })
        }catch (err) {
            if (err.code === 'ER_INVALID_USE_OF_NULL' ||
                err.code === 'ER_BAD_NULL_ERROR') {
                return res.status(400).json({
                    Message: "Cannot add NOT NULL while NULL values exist"
                });
            }
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }


    })

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
