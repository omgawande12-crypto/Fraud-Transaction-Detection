
/* =========================================
   FRAUD TRANSACTION DETECTION
   JavaScript Demo Project
========================================= */

// Get HTML elements

const transactionForm = document.getElementById("transactionForm");

const transactionTable = document.getElementById("transactionTable");

const resultBox = document.getElementById("result");

const searchInput = document.getElementById("searchTransaction");

const deleteAllButton = document.getElementById("deleteAll");

const emptyMessage = document.getElementById("emptyMessage");


// =========================================
// LOAD TRANSACTIONS
// =========================================

let transactions = [];

try {
    const savedData = localStorage.getItem("fraudTransactions");

    transactions = savedData ? JSON.parse(savedData) : [];

    if (!Array.isArray(transactions)) {
        transactions = [];
    }

} catch (error) {

    transactions = [];

}


// =========================================
// SAVE TRANSACTIONS
// =========================================

function saveTransactions() {

    localStorage.setItem(
        "fraudTransactions",
        JSON.stringify(transactions)
    );

}


// =========================================
// FRAUD DETECTION RULES
// =========================================

function detectFraud(amount, type, account) {

    /*
       Academic demo rules.

       These are NOT real banking fraud
       detection rules.
    */

    let reasons = [];

    // Rule 1: High transaction amount

    if (amount >= 50000) {

        reasons.push("High transaction amount");

    }

    // Rule 2: Very high transaction amount

    if (amount >= 100000) {

        reasons.push("Very high transaction amount");

    }

    // Rule 3: Withdrawal amount

    if (type === "Withdrawal" && amount >= 40000) {

        reasons.push("High value withdrawal");

    }

    // Rule 4: Transfer amount

    if (type === "Transfer" && amount >= 75000) {

        reasons.push("High value transfer");

    }

    // Rule 5: Account number validation

    if (!/^\d{4,20}$/.test(account)) {

        reasons.push("Invalid account number format");

    }

    // Final result

    if (reasons.length > 0) {

        return {
            status: "Fraud",
            reasons: reasons
        };

    }

    return {
        status: "Genuine",
        reasons: ["Transaction passed demo rules"]
    };

}


// =========================================
// FORM SUBMISSION
// =========================================

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get values

    const transactionId = document
        .getElementById("transactionId")
        .value
        .trim();

    const accountNumber = document
        .getElementById("accountNumber")
        .value
        .trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const transactionType = document
        .getElementById("transactionType")
        .value;


    // Validate amount

    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Please enter a valid transaction amount.");

        return;

    }


    // Validate account number

    if (!/^\d{4,20}$/.test(accountNumber)) {

        alert("Account number must contain 4 to 20 digits.");

        return;

    }


    // Check duplicate transaction ID

    const duplicate = transactions.some(function(transaction) {

        return transaction.id === transactionId;

    });

    if (duplicate) {

        alert("Transaction ID already exists.");

        return;

    }


    // Detect fraud

    const detection = detectFraud(
        amount,
        transactionType,
        accountNumber
    );


    // Create transaction

    const transaction = {

        id: transactionId,

        account: accountNumber,

        amount: amount,

        type: transactionType,

        status: detection.status,

        reasons: detection.reasons,

        date: new Date().toLocaleString()

    };


    // Add transaction

    transactions.unshift(transaction);


    // Save transaction

    saveTransactions();


    // Update dashboard

    updateDashboard();


    // Display result

    showResult(transaction);


    // Display history

    displayTransactions(searchInput.value);


    // Reset form

    transactionForm.reset();

});


// =========================================
// SHOW RESULT
// =========================================

function showResult(transaction) {

    resultBox.classList.remove("hidden");

    resultBox.classList.remove("fraud", "genuine");


    if (transaction.status === "Fraud") {

        resultBox.classList.add("fraud");

        resultBox.innerHTML = `
            <h3>⚠ Fraud Transaction Detected</h3>

            <p>Transaction ID: ${escapeHTML(transaction.id)}</p>

            <p>Amount: ₹${transaction.amount.toLocaleString("en-IN")}</p>

            <p>Status: Fraud</p>

            <p>Reason: ${transaction.reasons
                .map(escapeHTML)
                .join(", ")}</p>
        `;

    } else {

        resultBox.classList.add("genuine");

        resultBox.innerHTML = `
            <h3>✓ Genuine Transaction</h3>

            <p>Transaction ID: ${escapeHTML(transaction.id)}</p>

            <p>Amount: ₹${transaction.amount.toLocaleString("en-IN")}</p>

            <p>Status: Genuine</p>

            <p>Transaction passed demo rules.</p>
        `;

    }

}


// =========================================
// UPDATE DASHBOARD
// =========================================

function updateDashboard() {

    const total = transactions.length;

    const fraud = transactions.filter(function(transaction) {

        return transaction.status === "Fraud";

    }).length;

    const genuine = transactions.filter(function(transaction) {

        return transaction.status === "Genuine";

    }).length;


    document.getElementById("totalTransactions").textContent = total;

    document.getElementById("fraudTransactions").textContent = fraud;

    document.getElementById("genuineTransactions").textContent = genuine;

}


// =========================================
// DISPLAY TRANSACTION HISTORY
// =========================================

function displayTransactions(searchTerm = "") {

    transactionTable.innerHTML = "";

    const term = searchTerm.trim().toLowerCase();


    const filteredTransactions = transactions.filter(function(transaction) {

        return (

            transaction.id.toLowerCase().includes(term) ||

            transaction.account.toLowerCase().includes(term) ||

            transaction.type.toLowerCase().includes(term) ||

            transaction.status.toLowerCase().includes(term)

        );

    });


    emptyMessage.style.display = filteredTransactions.length === 0
        ? "block"
        : "none";


    filteredTransactions.forEach(function(transaction) {

        const row = document.createElement("tr");


        // Transaction ID

        const idCell = document.createElement("td");

        idCell.textContent = transaction.id;


        // Account

        const accountCell = document.createElement("td");

        accountCell.textContent = transaction.account;


        // Amount

        const amountCell = document.createElement("td");

        amountCell.textContent =
            "₹" + transaction.amount.toLocaleString("en-IN");


        // Type

        const typeCell = document.createElement("td");

        typeCell.textContent = transaction.type;


        // Status

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className =
            "status " +
            (transaction.status === "Fraud" ? "fraud" : "genuine");

        statusBadge.textContent = transaction.status;

        statusCell.appendChild(statusBadge);


        // Delete button

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.type = "button";


        deleteButton.addEventListener("click", function() {

            deleteTransaction(transaction.id);

        });


        actionCell.appendChild(deleteButton);


        // Add cells

        row.appendChild(idCell);

        row.appendChild(accountCell);

        row.appendChild(amountCell);

        row.appendChild(typeCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);


        transactionTable.appendChild(row);

    });

}


// =========================================
// DELETE SINGLE TRANSACTION
// =========================================

function deleteTransaction(transactionId) {

    const confirmation = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmation) {

        return;

    }


    transactions = transactions.filter(function(transaction) {

        return transaction.id !== transactionId;

    });


    saveTransactions();

    updateDashboard();

    displayTransactions(searchInput.value);

    resultBox.classList.add("hidden");

}


// =========================================
// DELETE ALL TRANSACTIONS
// =========================================

deleteAllButton.addEventListener("click", function() {

    if (transactions.length === 0) {

        alert("No transactions to delete.");

        return;

    }


    const confirmation = confirm(
        "Are you sure you want to clear all transactions?"
    );


    if (!confirmation) {

        return;

    }


    transactions = [];

    saveTransactions();

    updateDashboard();

    displayTransactions();

    resultBox.classList.add("hidden");

});


// =========================================
// SEARCH TRANSACTION
// =========================================

searchInput.addEventListener("input", function() {

    displayTransactions(searchInput.value);

});


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const replacements = {

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        };

        return replacements[character];

    });

}


// =========================================
// INITIALIZE WEBSITE
// =========================================

updateDashboard();

displayTransactions();

