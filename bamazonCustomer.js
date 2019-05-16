require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
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
                message: "Type in the item ID of the Item you wish to purchase?",
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like?",
                validate: function(value) {
                    if(isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {
            // console.log(answer.choice[8]);
            // console.log(results);
                let selectQty = answer.quantity;
                let index = parseInt(answer.choice[8]) - 1;
                // console.log(index);
                let productName = results[index].item_name;
                let purchaseCost = selectQty * results[index].price;
                
                    if (selectQty <= results[index].stock_quantity) {
                        let remainingQty = results[index].stock_quantity - answer.quantity;
                        // console.log(remainingQty);
                        connection.query(`UPDATE auctions SET ? WHERE ?`,
                        [
                          {
                              stock_quantity: remainingQty
                          },
                          {
                              id: answer.choice[8]
                          }
                        ],
                        function(err, results) {
                            if (err) throw err;
                            console.log(`You purchased ${selectQty} of ${productName} and your total cost was $${purchaseCost}. Thank you for shopping at Bamazon! Only ${remainingQty} left!`);
                        });
                        nextStep();
                        
                    } else if (selectQty > results[index].stock_quantity) {
                        console.log(`Sorry this item is out of stock! Please pick a different item or quantity. There is only ${results[index].stock_quantity} of ${productName}`);
                        displayItems();
                    };
    
    });
 });
}

function nextStep() {
    inquirer
      .prompt({
        name: "shopOrExit",
        type: "list",
        message: "Would you like to [Keep Shopping] or [Exit] ?",
        choices: ["Keep Shopping", "EXIT"]
      })
      .then(function(answer) {
        // based on their answer, either call the displayItem function or exit the app
        if (answer.shopOrExit === "Keep Shopping") {
          displayItems();
        }
        else if(answer.shopOrExit === "Exit") {
        connection.end();
        } 
      });
  }

