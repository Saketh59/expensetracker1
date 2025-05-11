// // 

// Add this at the very top of your script.js file to prevent FOUC
document.documentElement.classList.add('js-loading');

document.addEventListener("DOMContentLoaded", () => {
    // Remove loading class after everything is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.documentElement.classList.remove('js-loading');
        }, 100); // Small delay to ensure everything is ready
    });

    // Auth form handling
    const form = document.getElementById("auth-form");

    // Check if we're on the login/signup page
    if (form) {
        const formTitle = document.getElementById("form-title");
        const toggleText = document.getElementById("toggle-text");
        const message = document.getElementById("message");

        let isLogin = true;

        // Initialize the form state
        const setupInitialFormState = () => {
            const usernameInput = document.getElementById("signup-username");
            if (usernameInput) {
                usernameInput.style.display = isLogin ? "none" : "block";
            }
        };

        setupInitialFormState();

        // Toggle login/signup
        document.getElementById("toggle-text").addEventListener("click", (e) => {
            if (e.target.id === "toggle-link") {
                e.preventDefault();
                isLogin = !isLogin;

                formTitle.textContent = isLogin ? "Login" : "Signup";
                toggleText.innerHTML = isLogin
                    ? `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`
                    : `Already have an account? <a href="#" id="toggle-link">Login</a>`;

                const usernameInput = document.getElementById("signup-username");
                if (usernameInput) {
                    usernameInput.style.display = isLogin ? "none" : "block";
                }

                const submitButton = form.querySelector("button");
                if (submitButton) {
                    submitButton.textContent = isLogin ? "Login" : "Signup";
                }

                if (message) {
                    message.textContent = "";
                }
            }
        });

        // Handle form submission
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (!email || !password) {
                message.textContent = "Please fill in all required fields";
                return;
            }

            let data = { email, password };

            if (!isLogin) {
                const usernameInput = document.getElementById("signup-username");
                if (usernameInput) {
                    const username = usernameInput.value;
                    if (!username) {
                        message.textContent = "Please enter a username";
                        return;
                    }
                    data.username = username;
                }
            }

            const endpoint = isLogin ? "/login" : "/signup";

            try {
                message.textContent = "Processing...";

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    if (isLogin) {
                        message.textContent = "Login successful! Redirecting...";
                        setTimeout(() => {
                            window.location.href = "/dashboard";
                        }, 500);
                    } else {
                        message.textContent = "Signup successful! You can now log in.";
                        isLogin = true;
                        formTitle.textContent = "Login";
                        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;

                        const usernameInput = document.getElementById("signup-username");
                        if (usernameInput) {
                            usernameInput.style.display = "none";
                        }

                        const submitButton = form.querySelector("button");
                        if (submitButton) {
                            submitButton.textContent = "Login";
                        }

                        form.reset();
                    }
                } else {
                    message.textContent = result.error || "An error occurred";
                }
            } catch (error) {
                console.error("Auth error:", error);
                message.textContent = "A network error occurred. Please try again.";
            }
        });
    }

    const isDashboardPage = document.getElementById("dashboard-container") !== null;

    if (isDashboardPage) {
        loadUserInfo();
        setTimeout(() => {
            loadTransactions();
        }, 100);
    }

    // Manual transaction entry
    const manualEntryForm = document.getElementById("manual-entry-form");
    if (manualEntryForm) {
        manualEntryForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const category = document.getElementById("category").value;
            const subcategory = document.getElementById("subcategory").value;
            const note = document.getElementById("note").value;
            const amount = document.getElementById("amount").value;

            if (!category || !amount) {
                alert("Please fill in all required fields");
                return;
            }

            const formData = new FormData();
            formData.append("category", category);
            formData.append("subcategory", subcategory);
            formData.append("note", note);
            formData.append("amount", amount);

            try {
                const response = await fetch("/add_transaction", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    manualEntryForm.reset();
                    loadTransactions();
                } else {
                    alert(result.error || "An error occurred");
                }
            } catch (error) {
                console.error("Transaction error:", error);
                alert("A network error occurred. Please try again.");
            }
        });
    }
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch("/user_info");

        if (response.ok) {
            const data = await response.json();
            const usernameDisplay = document.getElementById("user-name-display");
            if (usernameDisplay) {
                usernameDisplay.textContent = data.username;
            }
        } else {
            if (document.getElementById("dashboard-container")) {
                window.location.href = "/";
            }
        }
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

// Load transactions
async function loadTransactions() {
    const transactionsContainer = document.getElementById("transactions");
    if (!transactionsContainer) return;

    try {
        transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Loading transactions...</p>";

        const response = await fetch("/get_transactions");

        if (response.ok) {
            const data = await response.json();

            transactionsContainer.innerHTML = "<h3>Recent Transactions</h3>";

            if (!data.transactions || data.transactions.length === 0) {
                transactionsContainer.innerHTML += "<p>No transactions yet</p>";
                return;
            }

            const fragment = document.createDocumentFragment();

            data.transactions.forEach(txn => {
                const txnDiv = document.createElement("div");
                txnDiv.classList.add("transaction-entry");

                let content = `<strong>${txn.category}</strong>: $${parseFloat(txn.amount).toFixed(2)}`;

                if (txn.subcategory) {
                    content += ` (${txn.subcategory})`;
                }

                content += ` - ${formatDate(txn.date)}`;

                if (txn.note) {
                    content += `<br><em>${txn.note}</em>`;
                }

                txnDiv.innerHTML = content;
                fragment.appendChild(txnDiv);
            });

            transactionsContainer.appendChild(fragment);
        } else {
            console.error("Failed to load transactions");
            transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Error loading transactions</p>";
        }
    } catch (error) {
        console.error("Error loading transactions:", error);
        transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Error loading transactions</p>";
    }
}
const csvForm = document.getElementById("csv-upload-form");
    if (csvForm) {
        csvForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await uploadCSV();
        });
    }


// async function uploadCSV() {
//     console.log("Upload CSV function triggered");
    
//     const fileInput = document.getElementById('csv-file');
//     const file = fileInput.files[0];

//     if (!file) {
//         alert('Please select a CSV file.');
//         return;
//     }

//     // Validate file type (optional but good practice)
//     if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
//         alert('Please upload a valid CSV file.');
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     const statusDiv = document.getElementById('uploadStatus');
//     const previewBox = document.getElementById('previewBox');

//     // Reset status and preview
//     statusDiv.textContent = 'Uploading...';
//     previewBox.innerHTML = '';

//     try {
//         const response = await fetch('/upload_csv', {
//             method: 'POST',
//             body: formData
//         });

//         const data = await response.json();

//         if (response.ok) {
//             statusDiv.textContent = data.message || 'CSV uploaded successfully!';
//         } else {
//             statusDiv.textContent = data.error || 'Failed to upload CSV.';
//             return;
//         }

//         // Show uploaded file name
//         previewBox.innerHTML = `<p>Uploaded File: <strong>${file.name}</strong></p>`;

//         if (data.preview && Array.isArray(data.preview) && data.preview.length > 0) {
//             let tableHTML = '<table border="1" cellpadding="5" cellspacing="0"><tr>';

//             // Headers
//             Object.keys(data.preview[0]).forEach(key => {
//                 tableHTML += `<th>${key}</th>`;
//             });
//             tableHTML += '</tr>';

//             // Data rows
//             data.preview.forEach(row => {
//                 tableHTML += '<tr>';
//                 Object.values(row).forEach(val => {
//                     tableHTML += `<td>${val}</td>`;
//                 });
//                 tableHTML += '</tr>';
//             });
//             tableHTML += '</table>';

//             // Append table to preview
//             previewBox.insertAdjacentHTML('beforeend', tableHTML);
//         } else {
//             previewBox.insertAdjacentHTML('beforeend', '<p>No data found in CSV.</p>');
//         }
//     } catch (error) {
//         console.error("Error uploading CSV:", error);
//         statusDiv.textContent = 'An error occurred while uploading. Please try again.';
//     }
// }

// async function uploadCSV() {
//     console.log("Upload CSV function triggered");

//     const fileInput = document.getElementById('csv-file');
//     const file = fileInput.files[0];

//     if (!file) {
//         alert('Please select a CSV file.');
//         return;
//     }

//     // Validate file type
//     if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
//         alert('Please upload a valid CSV file.');
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     const statusDiv = document.getElementById('uploadStatus');
//     const previewBox = document.getElementById('previewBox');

//     // Reset status and preview
//     statusDiv.textContent = 'Uploading...';
//     previewBox.innerHTML = '';

//     try {
//         const response = await fetch('/upload_csv', {
//             method: 'POST',
//             body: formData
//         });

//         const data = await response.json();

//         if (response.ok) {
//             statusDiv.textContent = data.message || 'CSV uploaded successfully!';

//             // ✅ Refresh transactions after CSV upload
//             loadTransactions();
//         } else {
//             statusDiv.textContent = data.error || 'Failed to upload CSV.';
//             return;
//         }

//         // Show uploaded file name
//         previewBox.innerHTML = `<p>Uploaded File: <strong>${file.name}</strong></p>`;

//         if (data.preview && Array.isArray(data.preview) && data.preview.length > 0) {
//             let tableHTML = '<table border="1" cellpadding="5" cellspacing="0"><tr>';

//             // Headers
//             Object.keys(data.preview[0]).forEach(key => {
//                 tableHTML += `<th>${key}</th>`;
//             });
//             tableHTML += '</tr>';

//             // Data rows
//             data.preview.forEach(row => {
//                 tableHTML += '<tr>';
//                 Object.values(row).forEach(val => {
//                     tableHTML += `<td>${val}</td>`;
//                 });
//                 tableHTML += '</tr>';
//             });
//             tableHTML += '</table>';

//             previewBox.insertAdjacentHTML('beforeend', tableHTML);
//         } else {
//             previewBox.insertAdjacentHTML('beforeend', '<p>No data found in CSV.</p>');
//         }
//     } catch (error) {
//         console.error("Error uploading CSV:", error);
//         statusDiv.textContent = 'An error occurred while uploading. Please try again.';
//     }
// }

async function uploadCSV() {
    console.log("Upload CSV function triggered");

    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
        alert('Please upload a valid CSV file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const statusDiv = document.getElementById('uploadStatus');
    const previewBox = document.getElementById('previewBox');

    // Reset status and preview
    statusDiv.textContent = 'Uploading...';
    previewBox.innerHTML = '';

    try {
        const response = await fetch('/upload_csv', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            statusDiv.textContent = data.error || 'Failed to upload CSV.';
            console.error("Upload failed:", data.error);
            return;
        }

        // Success case
        statusDiv.textContent = data.message || 'CSV uploaded successfully!';
        
        // Show uploaded file name
        previewBox.innerHTML = `<p>Uploaded File: <strong>${file.name}</strong></p>`;

        // Display header information
        if (data.headers && data.headers.length > 0) {
            previewBox.innerHTML += `<p>Detected columns: ${data.headers.join(', ')}</p>`;
        }

        // Display preview data with category grouping
        if (data.preview && Array.isArray(data.preview) && data.preview.length > 0) {
            // Create a map of categories to rows for visualization
            const categoryGroups = {};
            
            data.preview.forEach(row => {
                const category = row.category || 'Uncategorized';
                if (!categoryGroups[category]) {
                    categoryGroups[category] = [];
                }
                categoryGroups[category].push(row);
            });
            
            // Now create tables for each category
            for (const [category, rows] of Object.entries(categoryGroups)) {
                if (rows.length === 0) continue;
                
                previewBox.innerHTML += `<h4>Category: ${category}</h4>`;
                
                let tableHTML = '<table border="1" cellpadding="5" cellspacing="0"><tr>';
                
                // Headers (from first row)
                Object.keys(rows[0]).forEach(key => {
                    tableHTML += `<th>${key}</th>`;
                });
                tableHTML += '</tr>';
                
                // Data rows
                rows.forEach(row => {
                    tableHTML += '<tr>';
                    Object.values(row).forEach(val => {
                        tableHTML += `<td>${val || ''}</td>`;
                    });
                    tableHTML += '</tr>';
                });
                tableHTML += '</table><br>';
                
                previewBox.insertAdjacentHTML('beforeend', tableHTML);
            }
        } else {
            previewBox.insertAdjacentHTML('beforeend', '<p>No preview data available.</p>');
        }
        
        // Refresh the transactions display to show the newly imported data
        loadTransactions();
        
    } catch (error) {
        console.error("Error uploading CSV:", error);
        statusDiv.textContent = 'An error occurred while uploading. Please try again.';
    }
}

// Upload receipt
function uploadReceipt() {
    const fileInput = document.getElementById("receipt-file");

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("Please select a receipt image to upload");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    fetch("/upload_receipt", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server returned an error");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            loadTransactions();
            fileInput.value = "";
        })
        .catch(error => {
            alert("Error uploading receipt: " + (error.message || "Unknown error"));
            console.error(error);
        });
}

// Get budget advice
function getBudgetAdvice() {
    const adviceOutput = document.getElementById("advice-output");
    if (!adviceOutput) return;

    adviceOutput.textContent = "Loading advice...";

    fetch("/get_budget_advice")
        .then(response => {
            if (!response.ok) {
                throw new Error("Server returned an error");
            }
            return response.json();
        })
        .then(data => {
            adviceOutput.textContent = data.advice || "No advice available";
        })
        .catch(error => {
            adviceOutput.textContent = "Error loading advice";
            console.error("Error getting budget advice:", error);
        });
}

// Logout
function logout() {
    window.location.href = "/logout";
}

// Format date
function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid date";
    }
}
