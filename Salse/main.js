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

// part 3 -> 4
//Record a sale
    app.post('/AddSale', async (req, res) => {
        try{
            // check if product exists
            let check_query = `SELECT * FROM Products WHERE P_ID = ?`;
            let check_res=await pool.query(check_query,[req.body.P_ID]);
            if (check_res[0].length > 0) {
                let query = `INSERT INTO Sales (P_ID, Quantity_Sold, Sale_Date)
                             VALUES (?, ?, ?);`;
                let [insertedResult] = await pool.query(query, [
                    req.body.P_ID,
                    req.body.Quantity_Sold,
                    req.body.Sale_Date
                ]);
                let result = await pool.query(`SELECT *
                                               FROM Sales
                                               WHERE Sale_ID = ?`, [insertedResult.insertId]);
                return res.json({
                    Message: "Sales Added",
                    Data: result[0][0]
                })
            }else{
                return res.status(409).json({
                    Message: "Product Not Found"
                })
            }
        }catch(err){
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })



//● Retrieve all sales.
    app.get('/Sales', async (req, res) => {
        try{
            let query = `SELECT * FROM Sales`;
            let result = await pool.query(query);
            return res.status(200).json({
                Data: result[0]
            })
        }catch(err){
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })



//● Retrieve sales for a specific product.
app.get('/Sales/:id', async (req, res) => {
    const id = req.params.id;
    try{
        let query = `SELECT * FROM Sales WHERE P_ID = ?`;
        let result = await pool.query(query, [id]);
        if (result[0].length > 0) {
            return res.status(200).json({
                Data: result[0]
            })
        }else{
            return res.status(404).json({
                Message: "Product Not Found"
            })
        }
    }catch(err){
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
