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

// part 3 -> 3
//creat supplier
app.post('/AddSupplier', async (req, res) => {
    try {
        // check if sup exists
        let query = `select *
                     from Suppliers
                     WHERE Sup_Name = ?`;
        let result = await pool.query(query, [req.body.Sup_Name]);
        if (result[0].length > 0) {
            return res.status(409).json({
                Message: "Supplier already exists",
            })
        } else {
            let [insertedResult] =await pool.query(`INSERT INTO Suppliers (Sup_Name,S_ContactNumber) 
                                                 values (?,?)`,
                                            [
                                                 req.body.Sup_Name,
                                                 req.body.S_ContactNumber
                                            ]
            );
            query = `SELECT * FROM Suppliers WHERE Sup_ID = ?`;
            result = await pool.query(query,[insertedResult.insertId])
            return res.status(200).json({
                Message: "Supplier created successfully",
                Data: result[0]
            })


        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            Message: "Internal server error"
        });
    }
})


//Retrieve all suppliers.
app.get('/Suppliers', async (req, res) => {
  try {
      query = `select * FROM Suppliers`;
      result = await pool.query(query);
      return res.status(200).json({
          Data: result[0]
      });

  }catch (err) {
      console.log(err);
      return res.status(500).json({
          Message: "Internal server error"
      });
  }
})


// Update supplier information.
    app.put('/UpdateSupplier/:id', async (req, res) => {
        //check if sup exists
        try{
            const id = req.params.id;
            let query = `SELECT * FROM Suppliers WHERE Sup_ID = ?`;
            let result = await pool.query(query, [id]);
            if (result[0].length > 0) {
                let OldSup = result[0][0];
                let updatedSup = `UPDATE Suppliers SET Sup_Name = ?,
                                       S_ContactNumber = ?
                                      WHERE Sup_ID = ?`;
                await pool.query(updatedSup, [
                    req.body.Sup_Name ?? OldSup.Sup_Name,
                    req.body.S_ContactNumber ?? OldSup.S_ContactNumber,
                    id
                ])
                query = `SELECT * FROM Suppliers WHERE Sup_ID = ?`;
                updatedSup = await pool.query(query, [id]);
                return res.status(200).json({
                    Message: "Supplier updated successfully",
                    Data: updatedSup[0]
                })
            } else {
                return res.status(404).json({
                    Message: "Supplier not found"
                })
            }
        }catch (err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })


// Delete sup
    app.delete('/DeleteSupplier/:id', async (req, res) => {
        try{
            const id = req.params.id;
            let query = `SELECT * FROM Suppliers WHERE Sup_ID = ?`;
            let result = await pool.query(query, [id]);
            if (result[0].length > 0) {
                query = `DELETE FROM Suppliers WHERE Sup_ID = ?`;
                result = await pool.query(query, [id]);
                return res.status(200).json({
                    Message: "Supplier deleted successfully",
                })
            } else {
                return res.status(404).json({
                    Message: "Supplier not found"
                })
            }
        }catch (err) {
            console.log(err);
            return res.status(500).json({
                Message: "Internal server error"
            });
        }
    })



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});