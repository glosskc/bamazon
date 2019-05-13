require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");
// const MYSQLC = new MYSQL(keys.MYSQL);

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.mysql_password,
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  displayItems();
});

function displayItems() {
    connection.query("SELECT * FROM auctions", function(err, results){
        if (err) throw err;

        inquirer
        .prompt([
            {
                name: "choice",
                type: "rawlist",
                choices: function(){
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++){
                        choiceArray.push("Item ID " + results[i].id + " | Item: " + results[i].item_name + " | Dept: " + results[i].department_name + " | " + "$" + results[i].price + " | " + "Qty: " + results[i].stock_quantity);
                        
                    }
                    return choiceArray;
                },
                message: "What item would you like to buy?"
            },
            {}
        ])
    })
}