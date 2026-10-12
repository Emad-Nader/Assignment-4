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

// part 3 -> 2
//creat product

app.post('/AddProduct', async (req, res) => {
    try {
        // check if P exist

        let query = `SELECT *
                     FROM products
                     WHERE P_Name = ?`;
        let result = await pool.query(query, [req.body.P_Name]);

        if (result[0].length === 0) {
            let [insertResult] = await pool.query(
                `INSERT INTO products (P_Name, Price, Stock_Quantity, Sup_ID)
                 VALUES (?, ?, ?, ?)`,
                [
                    req.body.P_Name,
                    req.body.Price,
                    req.body.Stock_Quantity,
                    req.body.Sup_ID
                ]
            );

            query = `SELECT * FROM products WHERE P_ID = ?`;
            result = await pool.query(query, [insertResult.insertId]);

            return res.status(200).json({
                Message: 'Product added successfully ',
                Data: result[0]
            });
        }

        return res.status(409).json({
            message: "Product already exists"
        });

    } catch (error) {
        // Handle foreign key error
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'Supplier does not exist'
            });
        }
        console.log(err);
        return res.status(500).json({
            Message: "Internal server error"
        });
    }
});


//Retrieve all products.
app.get('/Products', async (req, res) => {
    try{
        let query = `SELECT * FROM products `;
        let Products = await pool.query(query);
        return res.status(200).json({
            Data: Products[0]
        })
    }catch(error){
        console.log(err);
        return res.status(500).json({
            Message: "Internal server error"
        });
    }
})

// Retrieve a product by ID.
app.get('/Products/:id', async (req, res) => {
 try {
     //check if product exists
     const id = req.params.id;
     query = `SELECT * FROM products WHERE P_ID = ?`;
     Product = await pool.query(query, [id]);
     if(Product[0].length === 0){
         return res.json({
             message: 'Product not found'
         })
     }else {

        return res.status(200).json({
            Data: Product[0]
        })
     }
 }catch(error){
     console.log(err);
     return res.status(500).json({
         Message: "Internal server error"
     });
 }
})


// Update a product.
app.put('/updateProduct/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let query = `SELECT * FROM products WHERE P_ID = ?`;
        let Product = await pool.query(query, [id]);
        if(Product[0].length === 0){
            return res.status(404).json({
                message: 'Product not found'
            })
        }else{
            const Old_Product = Product[0][0];
            const Update_query = `UPDATE products SET P_Name = ?,
                    Price = ?,
                    Stock_Quantity = ?,
                    Sup_ID = ?
                    WHERE P_ID = ?`;
            await pool.query(Update_query,[
                req.body.P_Name ?? Old_Product.P_Name,
                req.body.Price ?? Old_Product.Price,
                req.body.Stock_Quantity ?? Old_Product.Stock_Quantity,
                req.body.Sup_ID ?? Old_Product.Sup_ID,
                id
            ])
            query = `SELECT * FROM products WHERE P_ID = ?`;
            let updatedProduct = await pool.query(query, [id]);
            return res.status(200).json({
                Message: 'Product successfully updated',
                Data: updatedProduct[0]
            })
        }

    }catch(error){
        console.log(err);
        return res.status(500).json({
            Message: "Internal server error"
        });
    }
})

// Delete a product.
app.delete('/deleteProduct/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let query = `SELECT * FROM products WHERE P_ID = ?`;
        let Product = await pool.query(query, [id]);
        if(Product[0].length === 0){
            return res.status(404).json({
                message: 'Product not found'
            })
        }else {
            query = `DELETE FROM products WHERE P_ID = ?`;
            let deleted_Product = await pool.query(query, [id]);
            return res.status(200).json({
                Message: 'Product deleted successfully ',
            })
        }

    }catch(error){
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
