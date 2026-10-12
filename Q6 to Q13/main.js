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



// Q6 - Initialize Store

app.post("/InitializeStore", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // a. Add supplier if it doesn't exist
        const [suppliers] = await connection.query(
            "SELECT Sup_ID FROM Suppliers WHERE Sup_Name = ?",
            ["FreshFoods"]
        );

        let supplierId;

        if (suppliers.length === 0) {
            const [supplierResult] = await connection.query(
                "INSERT INTO Suppliers (Sup_Name, S_ContactNumber) VALUES (?, ?)",
                ["FreshFoods", "01001234567"]
            );

            supplierId = supplierResult.insertId;
        } else {
            supplierId = suppliers[0].Sup_ID;
        }

        // b. Add the three products
        const products = [
            ["Milk", 15.00, 50],
            ["Bread", 10.00, 30],
            ["Eggs", 20.00, 40]
        ];

        for (const product of products) {
            const [existingProduct] = await connection.query(
                "SELECT P_ID FROM Products WHERE P_Name = ? AND Sup_ID = ?",
                [product[0], supplierId]
            );

            if (existingProduct.length === 0) {
                await connection.query(
                    `INSERT INTO Products
(P_Name, Price, Stock_Quantity, Sup_ID)
VALUES (?, ?, ?, ?)`,
                    [product[0], product[1], product[2], supplierId]
                );
            }
        }

        // c. Add a sale of 2 Milk units on 2025-05-20
        const [milk] = await connection.query(
            "SELECT P_ID FROM Products WHERE P_Name = ? AND Sup_ID = ?",
            ["Milk", supplierId]
        );

        const milkId = milk[0].P_ID;

        const [existingSale] = await connection.query(
            `SELECT Sale_ID FROM Sales
WHERE P_ID = ? AND Quantity_Sold = ? AND Sale_Date = ?`,
            [milkId, 2, "2025-05-20"]
        );

        if (existingSale.length === 0) {
            await connection.query(
                `INSERT INTO Sales (P_ID, Quantity_Sold, Sale_Date)
VALUES (?, ?, ?)`,
                [milkId, 2, "2025-05-20"]
            );
        }

        await connection.commit();

        res.status(200).json({
            message: "Store initialized successfully",
            products: ["Milk", "Bread", "Eggs"],
            sale: "2 Milk units on 2025-05-20"
        });

    } catch (err) {
        await connection.rollback();
        console.error(err);

        res.status(500).json({
            message: "Failed to initialize store",
            error: err.message
        });
    } finally {
        connection.release();
    }
});



// Q7 UpdateBreadPrice
app.put('/UpdateBreadPrice', async (req, res) => {
    try {
        const [bread] = await pool.query(
            `SELECT P_ID FROM Products WHERE P_Name = ?`,
            ['Bread']
        );

        if (bread.length === 0) {
            return res.status(404).json({
                Message: "Bread not found"
            });
        }

        await pool.query(
            `UPDATE Products SET Price = ? WHERE P_ID = ?`,
            [25.00, bread[0].P_ID]
        );

        return res.status(200).json({
            Message: "Bread price updated to 25.00"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            Message: "Internal server error"
        });
    }
});



// Q8  Delete product Eggs

app.delete("/DeleteEggs", async (req, res) => {
    try {
        const [eggs] = await pool.query(
            "SELECT P_ID FROM Products WHERE P_Name = ?",
            ["Eggs"]
        );

        if (eggs.length === 0) {
            return res.status(404).json({
                message: "Eggs not found"
            });
        }

        await pool.query(
            "DELETE FROM Products WHERE P_ID = ?",
            [eggs[0].P_ID]
        );

        res.json({ message: "Eggs deleted successfully" });

    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Cannot delete Eggs because it has related sales"
            });
        }

        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Q9

app.get("/Reports/TotalSold", async (req, res) => {
    try {
        const [rows] = await pool.query(`
        SELECT
        Products.P_Name,
        COALESCE(SUM(Sales.Quantity_Sold), 0) AS Total_Quantity_Sold
    FROM Products
    LEFT JOIN Sales ON Products.P_ID = Sales.P_ID
    GROUP BY Products.P_ID, Products.P_Name
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Q10  Product with the highest stock

app.get("/Reports/HighestStock", async (req, res) => {
    try {
        const [rows] = await pool.query(`
    SELECT P_Name, Price, Stock_Quantity
    FROM Products
    WHERE Stock_Quantity = (
        SELECT MAX(Stock_Quantity)
    FROM Products
    )
    `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});




// Q11 Suppliers whose names start with F

app.get("/Reports/SuppliersStartingWithF", async (req, res) => {
    try {
        const [rows] = await pool.query(`
SELECT *
FROM Suppliers
WHERE Sup_Name LIKE 'F%'
    `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Q12 — Products that have never been sold

app.get("/Reports/NeverSold", async (req, res) => {
    try {
        const [rows] = await pool.query(`
SELECT Products.*
FROM Products
LEFT JOIN Sales ON Products.P_ID = Sales.P_ID
WHERE Sales.P_ID IS NULL
    `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});




//Q13 Retrieve all sales using JOIN

app.get("/Reports/SalesDetails", async (req, res) => {
    try {
        const [rows] = await pool.query(`
SELECT
Products.P_Name,
    Sales.Quantity_Sold,
    Sales.Sale_Date
FROM Sales
INNER JOIN Products ON Sales.P_ID = Products.P_ID
    `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Q14  Create user and grant permissions



// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
