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
    
    // Check if we're on the login page
    if (form) {
        const formTitle = document.getElementById("form-title");
        const toggleText = document.getElementById("toggle-text");
        const message = document.getElementById("message");
        
        // Handle toggle between login and signup
        let isLogin = true;
        
        // Initialize the form state once, before user sees it
        const setupInitialFormState = () => {
            const usernameInput = document.getElementById("username");
            if (usernameInput) {
                usernameInput.style.display = isLogin ? "none" : "block";
            }
        };
        
        // Run initial setup
        setupInitialFormState();
        
        // Set up toggle functionality - Use event delegation to avoid re-attaching listeners
        document.getElementById("toggle-text").addEventListener("click", (e) => {
            if (e.target.id === "toggle-link") {
                e.preventDefault();
                isLogin = !isLogin;
                
                // Update UI for login/signup mode
                formTitle.textContent = isLogin ? "Login" : "Signup";
                toggleText.innerHTML = isLogin
                    ? `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`
                    : `Already have an account? <a href="#" id="toggle-link">Login</a>`;
                
                // Toggle username field visibility - use a direct reference to the element
                const usernameInput = document.getElementById("username");
                if (usernameInput) {
                    usernameInput.style.display = isLogin ? "none" : "block";
                }
                
                const submitButton = form.querySelector("button");
                if (submitButton) {
                    submitButton.textContent = isLogin ? "Login" : "Signup";
                }
                
                // Clear any previous error messages
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
            
            // Validate inputs
            if (!email || !password) {
                message.textContent = "Please fill in all required fields";
                return;
            }
            
            let data = { email, password };
            
            // Add username if in signup mode
            if (!isLogin) {
                const usernameInput = document.getElementById("username");
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
                        // Use a timeout to show the success message before redirecting
                        setTimeout(() => {
                            window.location.href = "/dashboard";
                        }, 500);
                    } else {
                        message.textContent = "Signup successful! You can now log in.";
                        // Reset to login mode
                        isLogin = true;
                        formTitle.textContent = "Login";
                        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;
                        
                        const usernameInput = document.getElementById("username");
                        if (usernameInput) {
                            usernameInput.style.display = "none";
                        }
                        
                        const submitButton = form.querySelector("button");
                        if (submitButton) {
                            submitButton.textContent = "Login";
                        }
                        
                        // Clear the form
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

    // Check which page we're on
    const isLoginPage = document.getElementById("auth-form") !== null;
    const isDashboardPage = document.getElementById("dashboard-container") !== null;

    // Only load user info if we're on the dashboard page
    if (isDashboardPage) {
        loadUserInfo();
        // Slightly delay transaction loading to prevent UI jank
        setTimeout(() => {
            loadTransactions();
        }, 100);
    }

    // Handle manual transaction entry
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

// Function to load user information
async function loadUserInfo() {
    try {
        const response = await fetch("/user_info");
        
        if (response.ok) {
            const data = await response.json();
            const usernameDisplay = document.getElementById("username");
            if (usernameDisplay) {
                usernameDisplay.textContent = data.username;
            }
        } else {
            // Only redirect if we're on the dashboard page and not authorized
            if (document.getElementById("dashboard-container")) {
                window.location.href = "/";
            }
        }
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

// Function to load transactions
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
            
            // Build all the transaction elements before adding to DOM to prevent flicker
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
            
            // Add all transactions at once
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

// Function to upload CSV file
function uploadCSV() {
    const fileInput = document.getElementById("csv-file");
    
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("Please select a CSV file to upload");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    
    fetch("/upload_csv", {
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
        alert("Error uploading CSV: " + (error.message || "Unknown error"));
        console.error(error);
    });
}

// Function to upload receipt
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

// Function to get budget advice
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

// Function to log out
function logout() {
    window.location.href = "/logout";
}

// Helper function to format date
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