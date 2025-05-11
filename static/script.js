// // // 

// // Add this at the very top of your script.js file to prevent FOUC
// document.documentElement.classList.add('js-loading');

// document.addEventListener("DOMContentLoaded", () => {
//     // Remove loading class after everything is fully loaded
//     window.addEventListener('load', () => {
//         setTimeout(() => {
//             document.documentElement.classList.remove('js-loading');
//         }, 100); // Small delay to ensure everything is ready
//     });

//     // Auth form handling
//     const form = document.getElementById("auth-form");

//     // Check if we're on the login/signup page
//     if (form) {
//         const formTitle = document.getElementById("form-title");
//         const toggleText = document.getElementById("toggle-text");
//         const message = document.getElementById("message");

//         let isLogin = true;

//         // Initialize the form state
//         const setupInitialFormState = () => {
//             const usernameInput = document.getElementById("signup-username");
//             if (usernameInput) {
//                 usernameInput.style.display = isLogin ? "none" : "block";
//             }
//         };

//         setupInitialFormState();

//         // Toggle login/signup
//         document.getElementById("toggle-text").addEventListener("click", (e) => {
//             if (e.target.id === "toggle-link") {
//                 e.preventDefault();
//                 isLogin = !isLogin;

//                 formTitle.textContent = isLogin ? "Login" : "Signup";
//                 toggleText.innerHTML = isLogin
//                     ? `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`
//                     : `Already have an account? <a href="#" id="toggle-link">Login</a>`;

//                 const usernameInput = document.getElementById("signup-username");
//                 if (usernameInput) {
//                     usernameInput.style.display = isLogin ? "none" : "block";
//                 }

//                 const submitButton = form.querySelector("button");
//                 if (submitButton) {
//                     submitButton.textContent = isLogin ? "Login" : "Signup";
//                 }

//                 if (message) {
//                     message.textContent = "";
//                 }
//             }
//         });

//         // Handle form submission
//         form.addEventListener("submit", async (e) => {
//             e.preventDefault();

//             const email = document.getElementById("email").value;
//             const password = document.getElementById("password").value;

//             if (!email || !password) {
//                 message.textContent = "Please fill in all required fields";
//                 return;
//             }

//             let data = { email, password };

//             if (!isLogin) {
//                 const usernameInput = document.getElementById("signup-username");
//                 if (usernameInput) {
//                     const username = usernameInput.value;
//                     if (!username) {
//                         message.textContent = "Please enter a username";
//                         return;
//                     }
//                     data.username = username;
//                 }
//             }

//             const endpoint = isLogin ? "/login" : "/signup";

//             try {
//                 message.textContent = "Processing...";

//                 const response = await fetch(endpoint, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(data)
//                 });

//                 const result = await response.json();

//                 if (response.ok) {
//                     if (isLogin) {
//                         message.textContent = "Login successful! Redirecting...";
//                         setTimeout(() => {
//                             window.location.href = "/dashboard";
//                         }, 500);
//                     } else {
//                         message.textContent = "Signup successful! You can now log in.";
//                         isLogin = true;
//                         formTitle.textContent = "Login";
//                         toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up</a>`;

//                         const usernameInput = document.getElementById("signup-username");
//                         if (usernameInput) {
//                             usernameInput.style.display = "none";
//                         }

//                         const submitButton = form.querySelector("button");
//                         if (submitButton) {
//                             submitButton.textContent = "Login";
//                         }

//                         form.reset();
//                     }
//                 } else {
//                     message.textContent = result.error || "An error occurred";
//                 }
//             } catch (error) {
//                 console.error("Auth error:", error);
//                 message.textContent = "A network error occurred. Please try again.";
//             }
//         });
//     }

//     const isDashboardPage = document.getElementById("dashboard-container") !== null;

//     if (isDashboardPage) {
//         loadUserInfo();
//         setTimeout(() => {
//             loadTransactions();
//         }, 100);
//     }

//     // Manual transaction entry
//     const manualEntryForm = document.getElementById("manual-entry-form");
//     if (manualEntryForm) {
//         manualEntryForm.addEventListener("submit", async (e) => {
//             e.preventDefault();

//             const category = document.getElementById("category").value;
//             const subcategory = document.getElementById("subcategory").value;
//             const note = document.getElementById("note").value;
//             const amount = document.getElementById("amount").value;

//             if (!category || !amount) {
//                 alert("Please fill in all required fields");
//                 return;
//             }

//             const formData = new FormData();
//             formData.append("category", category);
//             formData.append("subcategory", subcategory);
//             formData.append("note", note);
//             formData.append("amount", amount);

//             try {
//                 const response = await fetch("/add_transaction", {
//                     method: "POST",
//                     body: formData
//                 });

//                 const result = await response.json();

//                 if (response.ok) {
//                     alert(result.message);
//                     manualEntryForm.reset();
//                     loadTransactions();
//                 } else {
//                     alert(result.error || "An error occurred");
//                 }
//             } catch (error) {
//                 console.error("Transaction error:", error);
//                 alert("A network error occurred. Please try again.");
//             }
//         });
//     }
// });

// // Load user info
// async function loadUserInfo() {
//     try {
//         const response = await fetch("/user_info");

//         if (response.ok) {
//             const data = await response.json();
//             const usernameDisplay = document.getElementById("user-name-display");
//             if (usernameDisplay) {
//                 usernameDisplay.textContent = data.username;
//             }
//         } else {
//             if (document.getElementById("dashboard-container")) {
//                 window.location.href = "/";
//             }
//         }
//     } catch (error) {
//         console.error("Error loading user info:", error);
//     }
// }

// // Load transactions
// async function loadTransactions() {
//     const transactionsContainer = document.getElementById("transactions");
//     if (!transactionsContainer) return;

//     try {
//         transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Loading transactions...</p>";

//         const response = await fetch("/get_transactions");

//         if (response.ok) {
//             const data = await response.json();

//             transactionsContainer.innerHTML = "<h3>Recent Transactions</h3>";

//             if (!data.transactions || data.transactions.length === 0) {
//                 transactionsContainer.innerHTML += "<p>No transactions yet</p>";
//                 return;
//             }

//             const fragment = document.createDocumentFragment();

//             data.transactions.forEach(txn => {
//                 const txnDiv = document.createElement("div");
//                 txnDiv.classList.add("transaction-entry");

//                 let content = `<strong>${txn.category}</strong>: $${parseFloat(txn.amount).toFixed(2)}`;

//                 if (txn.subcategory) {
//                     content += ` (${txn.subcategory})`;
//                 }

//                 content += ` - ${formatDate(txn.date)}`;

//                 if (txn.note) {
//                     content += `<br><em>${txn.note}</em>`;
//                 }

//                 txnDiv.innerHTML = content;
//                 fragment.appendChild(txnDiv);
//             });

//             transactionsContainer.appendChild(fragment);
//         } else {
//             console.error("Failed to load transactions");
//             transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Error loading transactions</p>";
//         }
//     } catch (error) {
//         console.error("Error loading transactions:", error);
//         transactionsContainer.innerHTML = "<h3>Recent Transactions</h3><p>Error loading transactions</p>";
//     }
// }
// const csvForm = document.getElementById("csv-upload-form");
//     if (csvForm) {
//         csvForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             await uploadCSV();
//         });
//     }

// // async function uploadCSV() {
// //     console.log("Upload CSV function triggered");

// //     const fileInput = document.getElementById('csv-file');
// //     const file = fileInput.files[0];

// //     if (!file) {
// //         alert('Please select a CSV file.');
// //         return;
// //     }

// //     // Validate file type
// //     if (!file.name.endsWith('.csv')) {
// //         alert('Please upload a valid CSV file.');
// //         return;
// //     }

// //     const formData = new FormData();
// //     formData.append('file', file);

// //     const statusDiv = document.getElementById('uploadStatus');
// //     const previewBox = document.getElementById('previewBox');

// //     // Reset status and preview
// //     statusDiv.textContent = 'Uploading...';
// //     previewBox.innerHTML = '';

// //     try {
// //         const response = await fetch('/upload_csv', {
// //             method: 'POST',
// //             body: formData
// //         });

// //         const data = await response.json();

// //         if (!response.ok) {
// //             statusDiv.textContent = data.error || 'Failed to upload CSV.';
// //             console.error("Upload failed:", data.error);
// //             return;
// //         }

// //         // Success case
// //         statusDiv.textContent = data.message || 'CSV uploaded successfully!';
        
// //         // Show uploaded file name
// //         previewBox.innerHTML = `<p>Uploaded File: <strong>${file.name}</strong></p>`;

// //         // Display header information
// //         if (data.headers && data.headers.length > 0) {
// //             previewBox.innerHTML += `<p>Detected columns: ${data.headers.join(', ')}</p>`;
// //         }

// //         // Display preview data with category grouping
// //         if (data.preview && Array.isArray(data.preview) && data.preview.length > 0) {
// //             // Create a map of categories to rows for visualization
// //             const categoryGroups = {};
            
// //             data.preview.forEach(row => {
// //                 const category = row.category || 'Uncategorized';
// //                 if (!categoryGroups[category]) {
// //                     categoryGroups[category] = [];
// //                 }
// //                 categoryGroups[category].push(row);
// //             });
            
// //             // Now create tables for each category
// //             for (const [category, rows] of Object.entries(categoryGroups)) {
// //                 if (rows.length === 0) continue;
                
// //                 previewBox.innerHTML += `<h4>Category: ${category}</h4>`;
                
// //                 let tableHTML = '<table border="1" cellpadding="5" cellspacing="0"><tr>';
                
// //                 // Headers (from first row)
// //                 Object.keys(rows[0]).forEach(key => {
// //                     tableHTML += `<th>${key}</th>`;
// //                 });
// //                 tableHTML += '</tr>';
                
// //                 // Data rows
// //                 rows.forEach(row => {
// //                     tableHTML += '<tr>';
// //                     Object.values(row).forEach(val => {
// //                         tableHTML += `<td>${val || ''}</td>`;
// //                     });
// //                     tableHTML += '</tr>';
// //                 });
// //                 tableHTML += '</table><br>';
                
// //                 previewBox.insertAdjacentHTML('beforeend', tableHTML);
// //             }
// //         } else {
// //             previewBox.insertAdjacentHTML('beforeend', '<p>No preview data available.</p>');
// //         }
        
// //         // Refresh the transactions display to show the newly imported data
// //         loadTransactions();
        
// //     } catch (error) {
// //         console.error("Error uploading CSV:", error);
// //         statusDiv.textContent = 'An error occurred while uploading. Please try again.';
// //     }
// // }

// // async function uploadCSV() {
// //     console.log("Upload CSV function triggered");

// //     const fileInput = document.getElementById('csv-file');
// //     const file = fileInput.files[0];

// //     if (!file) {
// //         alert('Please select a CSV file.');
// //         return;
// //     }

// //     // Validate file type
// //     if (!file.name.endsWith('.csv')) {
// //         alert('Please upload a valid CSV file.');
// //         return;
// //     }

// //     const formData = new FormData();
// //     formData.append('file', file);

// //     const statusDiv = document.getElementById('uploadStatus');
// //     const previewBox = document.getElementById('previewBox');

// //     // Reset status and preview
// //     statusDiv.textContent = 'Uploading...';
// //     previewBox.innerHTML = '';

// //     try {
// //         const response = await fetch('/upload_csv', {
// //             method: 'POST',
// //             body: formData
// //         });

// //         const data = await response.json();

// //         if (!response.ok) {
// //             statusDiv.textContent = data.error || 'Failed to upload CSV.';
// //             console.error("Upload failed:", data.error);
// //             return;
// //         }

// //         // Success case
// //         statusDiv.textContent = data.message || 'CSV uploaded successfully!';
        
// //         // Show uploaded file name and success message with styling
// //         previewBox.innerHTML = `
// //             <div style="margin-bottom: 15px; background-color: #e8f5e9; padding: 10px; border-radius: 4px;">
// //                 <strong>Success!</strong> Uploaded file: ${file.name}<br>
// //                 ${data.message}
// //             </div>`;

// //         // Display header information
// //         if (data.headers && data.headers.length > 0) {
// //             previewBox.innerHTML += `
// //                 <div style="margin-bottom: 15px;">
// //                     <strong>Detected columns:</strong> ${data.headers.join(', ')}
// //                 </div>`;
// //         }

// //         // Display preview data with category grouping
// //         if (data.preview && Array.isArray(data.preview) && data.preview.length > 0) {
// //             previewBox.innerHTML += `<h4>Transaction Preview (Top 3 per category)</h4>`;
            
// //             // Create a map of categories to rows for visualization
// //             const categoryGroups = {};
            
// //             data.preview.forEach(row => {
// //                 // Find the category field regardless of case
// //                 let category = 'Uncategorized';
                
// //                 // The backend now normalizes the data, so we should have a standard 'category' field
// //                 if (row.category) {
// //                     category = row.category;
// //                 }
                
// //                 if (!categoryGroups[category]) {
// //                     categoryGroups[category] = [];
// //                 }
// //                 categoryGroups[category].push(row);
// //             });
            
// //             // Now create tables for each category
// //             for (const [category, rows] of Object.entries(categoryGroups)) {
// //                 if (rows.length === 0) continue;
                
// //                 previewBox.innerHTML += `
// //                     <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold;">
// //                         Category: ${category}
// //                     </div>`;
                
// //                 let tableHTML = '<table border="1" cellpadding="5" cellspacing="0" style="margin-bottom: 15px; width: 100%;"><tr style="background-color: #f2f2f2;">';
                
// //                 // Headers (use standardized keys)
// //                 const displayHeaders = ['category', 'type', 'amount', 'subcategory', 'note'];
                
// //                 // Add standard headers first
// //                 displayHeaders.forEach(key => {
// //                     if (key in rows[0]) {
// //                         tableHTML += `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`;
// //                     }
// //                 });
                
// //                 // Add any additional custom headers
// //                 Object.keys(rows[0]).forEach(key => {
// //                     if (!displayHeaders.includes(key.toLowerCase())) {
// //                         tableHTML += `<th>${key}</th>`;
// //                     }
// //                 });
                
// //                 tableHTML += '</tr>';
                
// //                 // Data rows
// //                 rows.forEach(row => {
// //                     tableHTML += '<tr>';
                    
// //                     // Add standard fields first in a specific order
// //                     displayHeaders.forEach(key => {
// //                         if (key in row) {
// //                             const value = row[key] || '';
// //                             tableHTML += `<td>${value}</td>`;
// //                         }
// //                     });
                    
// //                     // Add any additional custom fields
// //                     Object.entries(row).forEach(([key, value]) => {
// //                         if (!displayHeaders.includes(key.toLowerCase())) {
// //                             tableHTML += `<td>${value || ''}</td>`;
// //                         }
// //                     });
                    
// //                     tableHTML += '</tr>';
// //                 });
// //                 tableHTML += '</table>';
                
// //                 previewBox.insertAdjacentHTML('beforeend', tableHTML);
// //             }
// //         } else {
// //             previewBox.insertAdjacentHTML('beforeend', '<p>No preview data available.</p>');
// //         }
        
// //         // Clear the file input for next use
// //         fileInput.value = '';
        
// //         // Refresh the transactions display to show the newly imported data
// //         setTimeout(() => {
// //             loadTransactions();
// //         }, 500);
        
// //     } catch (error) {
// //         console.error("Error uploading CSV:", error);
// //         statusDiv.textContent = 'An error occurred while uploading. Please try again.';
// //         previewBox.innerHTML = `
// //             <div style="color: #d32f2f; margin-top: 10px;">
// //                 Error: ${error.message || 'Unknown error occurred during upload'}
// //             </div>`;
// //     }
// // }

// // This function handles the CSV upload and displays transactions
// function handleCSVUpload() {
//     const fileInput = document.getElementById('csvFile');
//     const uploadBtn = document.getElementById('uploadCSVBtn');
//     const uploadStatus = document.getElementById('uploadStatus');
    
//     if (!fileInput.files.length) {
//         alert('Please select a CSV file first');
//         return;
//     }
    
//     const file = fileInput.files[0];
//     if (!file.name.endsWith('.csv')) {
//         alert('Please select a CSV file');
//         return;
//     }
    
//     // Show upload status
//     uploadBtn.disabled = true;
//     uploadStatus.innerText = 'Uploading...';
//     uploadStatus.style.display = 'block';
    
//     const formData = new FormData();
//     formData.append('file', file);
    
//     // Send the file to the server
//     fetch('/upload_csv', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) {
//             return response.json().then(data => {
//                 throw new Error(data.error || 'Error uploading CSV');
//             });
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('CSV upload successful:', data);
//         uploadStatus.innerText = data.message || 'Upload successful';
//         uploadStatus.style.color = 'green';
        
//         // Reset file input
//         fileInput.value = '';
        
//         // Display the imported transactions if they're included in the response
//         if (data.transactions && data.transactions.length > 0) {
//             displayImportedTransactions(data.transactions);
//         } else {
//             // If no transactions in response, refresh to get latest transactions
//             loadTransactions();
//         }
        
//         // Show preview data if available
//         if (data.preview && data.preview.length > 0) {
//             displayCSVPreview(data.preview, data.headers);
//         }
//     })
//     .catch(error => {
//         console.error('CSV upload error:', error);
//         uploadStatus.innerText = error.message || 'Error uploading CSV';
//         uploadStatus.style.color = 'red';
//     })
//     .finally(() => {
//         uploadBtn.disabled = false;
//         // After 5 seconds, hide the status message
//         setTimeout(() => {
//             uploadStatus.style.display = 'none';
//         }, 5000);
//     });
// }

// // Function to display imported transactions
// function displayImportedTransactions(transactions) {
//     // Get the transactions table body
//     const tbody = document.querySelector('#transactionsTable tbody');
    
//     // Clear loading indicator if present
//     const loadingRow = document.getElementById('loadingRow');
//     if (loadingRow) {
//         loadingRow.remove();
//     }
    
//     // If table is empty, clear any "no transactions" message
//     if (tbody.innerText.includes('No transactions found')) {
//         tbody.innerHTML = '';
//     }
    
//     // Add each transaction to the table
//     transactions.forEach(txn => {
//         // Create new row at the top of the table
//         const newRow = tbody.insertRow(0);
        
//         // Format the date
//         let formattedDate = txn.date;
//         try {
//             // Try to parse and format the date (assuming ISO format)
//             const date = new Date(txn.date);
//             formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//         } catch (e) {
//             console.log('Could not format date:', e);
//         }
        
//         // Set row HTML
//         newRow.innerHTML = `
//             <td>${txn.type}</td>
//             <td>${txn.category}</td>
//             <td>${txn.subcategory || ''}</td>
//             <td>${txn.note || ''}</td>
//             <td class="amount ${txn.type === 'Income' ? 'income' : 'expense'}">
//                 ${txn.type === 'Income' ? '+' : '-'} ₹${parseFloat(txn.amount).toFixed(2)}
//             </td>
//             <td>${formattedDate}</td>
//         `;
        
//         // Add a highlight effect to new rows
//         newRow.classList.add('highlight-new');
//         setTimeout(() => {
//             newRow.classList.remove('highlight-new');
//         }, 3000);
//     });
    
//     // Update any counters or totals
//     updateTransactionStats();
// }

// // Function to display CSV preview
// function displayCSVPreview(previewData, headers) {
//     const previewContainer = document.getElementById('csvPreviewContainer');
//     if (!previewContainer) return;
    
//     // Create a preview table
//     let previewHTML = `
//         <h4>CSV Preview (Sample Entries)</h4>
//         <div class="table-responsive">
//             <table class="table table-sm table-striped">
//                 <thead>
//                     <tr>
//                         ${headers.map(header => `<th>${header}</th>`).join('')}
//                     </tr>
//                 </thead>
//                 <tbody>
//     `;
    
//     // Add preview rows
//     previewData.forEach(row => {
//         previewHTML += '<tr>';
//         headers.forEach(header => {
//             previewHTML += `<td>${row[header] || ''}</td>`;
//         });
//         previewHTML += '</tr>';
//     });
    
//     previewHTML += `
//                 </tbody>
//             </table>
//         </div>
//     `;
    
//     previewContainer.innerHTML = previewHTML;
//     previewContainer.style.display = 'block';
    
//     // Scroll to preview
//     previewContainer.scrollIntoView({ behavior: 'smooth' });
// }

// // Function to load transactions (refresh the list)
// function loadTransactions() {
//     const tbody = document.querySelector('#transactionsTable tbody');
    
//     // Show loading indicator
//     tbody.innerHTML = `
//         <tr id="loadingRow">
//             <td colspan="6" class="text-center">
//                 <div class="spinner-border spinner-border-sm" role="status">
//                     <span class="visually-hidden">Loading...</span>
//                 </div>
//                 Loading transactions...
//             </td>
//         </tr>
//     `;
    
//     fetch('/get_transactions')
//         .then(response => response.json())
//         .then(data => {
//             tbody.innerHTML = ''; // Clear loading indicator
            
//             if (!data.transactions || data.transactions.length === 0) {
//                 tbody.innerHTML = `
//                     <tr>
//                         <td colspan="6" class="text-center">No transactions found</td>
//                     </tr>
//                 `;
//                 return;
//             }
            
//             // Display transactions
//             data.transactions.forEach(txn => {
//                 const row = tbody.insertRow();
                
//                 // Format the date
//                 let formattedDate = txn.date;
//                 try {
//                     const date = new Date(txn.date);
//                     formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//                 } catch (e) {
//                     console.log('Could not format date:', e);
//                 }
                
//                 row.innerHTML = `
//                     <td>${txn.type}</td>
//                     <td>${txn.category}</td>
//                     <td>${txn.subcategory || ''}</td>
//                     <td>${txn.note || ''}</td>
//                     <td class="amount ${txn.type === 'Income' ? 'income' : 'expense'}">
//                         ${txn.type === 'Income' ? '+' : '-'} ₹${parseFloat(txn.amount).toFixed(2)}
//                     </td>
//                     <td>${formattedDate}</td>
//                 `;
//             });
            
//             // Update budget advice if available
//             if (data.budget_advice) {
//                 const adviceContainer = document.getElementById('budgetAdvice');
//                 if (adviceContainer) {
//                     // Replace newlines with <br> for proper display
//                     adviceContainer.innerHTML = data.budget_advice.replace(/\n/g, '<br>');
//                     adviceContainer.style.display = 'block';
//                 }
//             }
            
//             // Update transaction stats
//             updateTransactionStats();
//         })
//         .catch(error => {
//             console.error('Error fetching transactions:', error);
//             tbody.innerHTML = `
//                 <tr>
//                     <td colspan="6" class="text-center text-danger">
//                         Error loading transactions. Please try again.
//                     </td>
//                 </tr>
//             `;
//         });
// }

// // Function to update transaction statistics
// function updateTransactionStats() {
//     // This function would update any counters, totals, or charts
//     // Implement based on your UI needs
// }

// // Add event listeners when the DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     // Load transactions on page load
//     loadTransactions();
    
//     // Set up the CSV upload button event listener
//     const uploadBtn = document.getElementById('uploadCSVBtn');
//     if (uploadBtn) {
//         uploadBtn.addEventListener('click', handleCSVUpload);
//     }
    
//     // Add file input change event to show filename
//     const fileInput = document.getElementById('csvFile');
//     if (fileInput) {
//         fileInput.addEventListener('change', function() {
//             const fileNameElement = document.getElementById('selectedFileName');
//             if (fileNameElement) {
//                 fileNameElement.textContent = this.files.length ? this.files[0].name : 'No file selected';
//             }
//         });
//     }
// });

// // Upload receipt
// function uploadReceipt() {
//     const fileInput = document.getElementById("receipt-file");

//     if (!fileInput || !fileInput.files || !fileInput.files[0]) {
//         alert("Please select a receipt image to upload");
//         return;
//     }

//     const formData = new FormData();
//     formData.append("file", fileInput.files[0]);

//     fetch("/upload_receipt", {
//         method: "POST",
//         body: formData
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("Server returned an error");
//             }
//             return response.json();
//         })
//         .then(data => {
//             alert(data.message);
//             loadTransactions();
//             fileInput.value = "";
//         })
//         .catch(error => {
//             alert("Error uploading receipt: " + (error.message || "Unknown error"));
//             console.error(error);
//         });
// }

// // Get budget advice
// function getBudgetAdvice() {
//     const adviceOutput = document.getElementById("advice-output");
//     if (!adviceOutput) return;

//     adviceOutput.textContent = "Loading advice...";

//     fetch("/get_budget_advice")
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("Server returned an error");
//             }
//             return response.json();
//         })
//         .then(data => {
//             adviceOutput.textContent = data.advice || "No advice available";
//         })
//         .catch(error => {
//             adviceOutput.textContent = "Error loading advice";
//             console.error("Error getting budget advice:", error);
//         });
// }

// // Logout
// function logout() {
//     window.location.href = "/logout";
// }

// // Format date
// function formatDate(dateString) {
//     if (!dateString) return "Unknown date";

//     try {
//         const date = new Date(dateString);
//         return date.toLocaleDateString();
//     } catch (e) {
//         console.error("Error formatting date:", e);
//         return "Invalid date";
//     }
// }

// Prevent Flash of Unstyled Content (FOUC)
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
        handleAuthForm(form);
    }

    const isDashboardPage = document.getElementById("dashboard-container") !== null;

    if (isDashboardPage) {
        loadUserInfo();
        setTimeout(() => {
            loadTransactions();
            getBudgetAdvice();
        }, 100);
    }

    // CSV file selection event listener
    const csvFileInput = document.getElementById('csvFile');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
            document.getElementById('selectedFileName').textContent = fileName;
            
            // Show preview when a file is selected
            if (e.target.files[0]) {
                previewCSV(e.target.files[0]);
            }
        });
    }

    // Upload CSV button event listener
    const uploadCSVBtn = document.getElementById('uploadCSVBtn');
    if (uploadCSVBtn) {
        uploadCSVBtn.addEventListener('click', handleCSVUpload);
    }

    // Manual transaction entry form
    const manualEntryForm = document.getElementById("manual-entry-form");
    if (manualEntryForm) {
        manualEntryForm.addEventListener("submit", handleManualEntry);
    }
});

// Handle authentication form functionality
function handleAuthForm(form) {
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

// Function to preview CSV file contents
function previewCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                displayCSVPreview(results);
            },
            error: function(error) {
                showUploadStatus('Error parsing CSV: ' + error.message, 'danger');
            }
        });
    };
    reader.readAsText(file);
}

// Function to display CSV preview
function displayCSVPreview(results) {
    const previewContainer = document.getElementById('csvPreviewContainer');
    const previewBox = document.getElementById('previewBox');
    
    if (!previewContainer || !previewBox) return;
    
    // Check if we have data
    if (results.data && results.data.length > 0) {
        // Create table for preview
        let previewHTML = '<div class="table-responsive"><table class="table table-sm table-bordered">';
        
        // Headers
        previewHTML += '<thead><tr>';
        results.meta.fields.forEach(field => {
            previewHTML += `<th>${field}</th>`;
        });
        previewHTML += '</tr></thead>';
        
        // Data rows (show up to 5 rows)
        previewHTML += '<tbody>';
        const rowLimit = Math.min(results.data.length, 5);
        for (let i = 0; i < rowLimit; i++) {
            previewHTML += '<tr>';
            results.meta.fields.forEach(field => {
                previewHTML += `<td>${results.data[i][field] || ''}</td>`;
            });
            previewHTML += '</tr>';
        }
        previewHTML += '</tbody></table></div>';
        
        // Show preview with count info
        const countInfo = `<p>Showing ${rowLimit} of ${results.data.length} entries</p>`;
        previewBox.innerHTML = countInfo + previewHTML;
        previewContainer.style.display = 'block';
    } else {
        previewBox.innerHTML = '<p>No data found in the CSV file.</p>';
        previewContainer.style.display = 'block';
    }
}

// Function to handle the CSV upload
function handleCSVUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showUploadStatus('Please select a CSV file first.', 'warning');
        return;
    }
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Show loading status
    showUploadStatus('Uploading and processing...', 'info');
    
    // Send the file to the server
    fetch('/upload_csv', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showUploadStatus(`Successfully imported ${data.count || ''} transactions!`, 'success');
            // Refresh the transactions table
            loadTransactions();
            // Update budget advice
            getBudgetAdvice();
            
            // Display imported transactions if available
            if (data.transactions && data.transactions.length > 0) {
                displayImportedTransactions(data.transactions);
            }
            
            // Reset file input
            fileInput.value = '';
        } else {
            showUploadStatus(`Error: ${data.message || 'Unknown error'}`, 'danger');
        }
    })
    .catch(error => {
        showUploadStatus(`Upload failed: ${error.message}`, 'danger');
    });
}

// Function to show upload status with appropriate styling
function showUploadStatus(message, type) {
    const statusElement = document.getElementById('uploadStatus');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `alert alert-${type}`;
    statusElement.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Function to handle manual transaction entry
async function handleManualEntry(e) {
    e.preventDefault();
    
    const formData = {
        type: document.getElementById('type').value || 'Expense',
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value,
        amount: document.getElementById('amount').value,
        note: document.getElementById('note')?.value || ''
    };
    
    if (!formData.category || !formData.amount) {
        showUploadStatus('Please fill in all required fields', 'warning');
        return;
    }
    
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear the form
            document.getElementById('manual-entry-form').reset();
            
            // Refresh transactions and show success message
            loadTransactions();
            showUploadStatus('Transaction added successfully!', 'success');
            
            // Update budget advice
            getBudgetAdvice();
        } else {
            showUploadStatus(`Error: ${data.message}`, 'danger');
        }
    })
    .catch(error => {
        showUploadStatus(`Error: ${error.message}`, 'danger');
    });
}

// Function to display imported transactions
function displayImportedTransactions(transactions) {
    // Get the transactions table body
    const tbody = document.querySelector('#transactionsTable tbody');
    if (!tbody) return;
    
    // Clear loading indicator if present
    const loadingRow = document.getElementById('loadingRow');
    if (loadingRow) {
        loadingRow.remove();
    }
    
    // If table is empty, clear any "no transactions" message
    if (tbody.innerText.includes('No transactions found')) {
        tbody.innerHTML = '';
    }
    
    // Add each transaction to the table
    transactions.forEach(txn => {
        // Create new row at the top of the table
        const newRow = tbody.insertRow(0);
        
        // Format the date
        let formattedDate = txn.date;
        try {
            // Try to parse and format the date (assuming ISO format)
            const date = new Date(txn.date);
            formattedDate = date.toLocaleDateString();
        } catch (e) {
            console.log('Could not format date:', e);
        }
        
        // Apply the appropriate class based on transaction type
        const amountClass = txn.type.toLowerCase() === 'income' ? 'income' : 'expense';
        
        // Format the amount with appropriate sign
        const formattedAmount = txn.type.toLowerCase() === 'income' 
            ? `+$${parseFloat(txn.amount).toFixed(2)}`
            : `-$${parseFloat(txn.amount).toFixed(2)}`;
        
        // Set row HTML
        newRow.innerHTML = `
            <td>${txn.type}</td>
            <td>${txn.category}</td>
            <td>${txn.subcategory || ''}</td>
            <td>${txn.note || ''}</td>
            <td class="${amountClass}">${formattedAmount}</td>
            <td>${formattedDate}</td>
        `;
        
        // Add a highlight effect to new rows
        newRow.classList.add('highlight-new');
        setTimeout(() => {
            newRow.classList.remove('highlight-new');
        }, 3000);
    });
    
    // Update any counters or totals
    updateTransactionStats();
}

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch("/api/user_info");

        if (response.ok) {
            const data = await response.json();
            const usernameDisplay = document.getElementById("user-name-display");
            if (usernameDisplay) {
                usernameDisplay.textContent = data.name || data.username || 'User';
            }
        } else {
            if (document.getElementById("dashboard-container")) {
                window.location.href = "/login";
            }
        }
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

// Function to load transactions from the server
function loadTransactions() {
    const tableBody = document.querySelector('#transactionsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr id="loadingRow">
            <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Loading transactions...
            </td>
        </tr>
    `;
    
    fetch('/api/transactions')
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        
        if (data.length === 0) {
            // Show a message if no transactions
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="6" class="text-center">No transactions found. Add some or import from CSV.</td>';
            tableBody.appendChild(noDataRow);
        } else {
            // Add each transaction to the table
            data.forEach(transaction => {
                const row = document.createElement('tr');
                
                // Apply the appropriate class based on transaction type
                const amountClass = transaction.type.toLowerCase() === 'income' ? 'income' : 'expense';
                
                // Format the amount with appropriate sign
                const formattedAmount = transaction.type.toLowerCase() === 'income' 
                    ? `+$${parseFloat(transaction.amount).toFixed(2)}`
                    : `-$${parseFloat(transaction.amount).toFixed(2)}`;
                
                // Format the date
                const formattedDate = new Date(transaction.date).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${transaction.type}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.subcategory || ''}</td>
                    <td>${transaction.note || ''}</td>
                    <td class="${amountClass}">${formattedAmount}</td>
                    <td>${formattedDate}</td>
                `;
                
                tableBody.appendChild(row);
            });
        }
        
        // Update transaction stats if needed
        updateTransactionStats();
    })
    .catch(error => {
        console.error('Error loading transactions:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading transactions. Please try again.
                </td>
            </tr>
        `;
    });
}

// Function to upload a receipt image
function uploadReceipt() {
    const fileInput = document.getElementById('receipt-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showUploadStatus('Please select an image file first.', 'warning');
        return;
    }
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Show loading status
    showUploadStatus('Uploading receipt and processing with OCR...', 'info');
    
    fetch('/upload_receipt', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showUploadStatus('Receipt processed successfully!', 'success');
            // Refresh data
            loadTransactions();
            getBudgetAdvice();
            // Clear the file input
            fileInput.value = '';
        } else {
            showUploadStatus(`Error processing receipt: ${data.message}`, 'danger');
        }
    })
    .catch(error => {
        showUploadStatus(`Upload failed: ${error.message}`, 'danger');
    });
}

// Function to get budget advice
function getBudgetAdvice() {
    fetch('/api/budget_advice')
    .then(response => response.json())
    .then(data => {
        const adviceElement = document.getElementById('budgetAdvice');
        const adviceOutput = document.getElementById('advice-output');
        
        if (!adviceElement && !adviceOutput) return;
        
        if (data.advice) {
            if (adviceElement) {
                adviceElement.innerHTML = data.advice;
                adviceElement.style.display = 'block';
            }
            
            // Also update the advice output if it exists
            if (adviceOutput) {
                adviceOutput.textContent = data.advice;
            }
        } else {
            if (adviceElement) {
                adviceElement.innerHTML = 'No budget advice available. Please add more transactions.';
                adviceElement.style.display = 'block';
            }
            
            if (adviceOutput) {
                adviceOutput.textContent = 'No advice available yet';
            }
        }
    })
    .catch(error => {
        console.error('Error getting budget advice:', error);
        const adviceOutput = document.getElementById('advice-output');
        if (adviceOutput) {
            adviceOutput.textContent = 'Error loading advice';
        }
    });
}

// Function to update transaction statistics
function updateTransactionStats() {
    // This function would update any counters, totals, or charts
    // Implement based on your UI needs
    console.log('Transaction stats updated');
}

// Function to handle logout
function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            // Fallback to simple redirect
            window.location.href = '/logout';
        }
    })
    .catch(error => {
        console.error('Logout failed:', error);
        // Fallback to simple redirect on error
        window.location.href = '/logout';
    });
}

// Format date helper function
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