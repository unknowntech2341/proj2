import Database from "../utils/database.js";
import { FormValidate } from "../utils/validate.js";
import Elements from "../utils/elements.js";

// Getting elements from the banner
const errorBanner = document.querySelector(".main_auth_error")
const greetText = document.querySelector(".main_banner_header_text")
const bannerMotivation = document.querySelector(".main_banner_text");

// Getting all the container tabs
const getIncomeContainer = document.querySelector(".main_income");
const getExpensesContainer = document.querySelector(".main_expenses");
const getBudgetContainer = document.querySelector(".main_budget");
const getAddContainer = document.querySelector(".main_add");

let budgetAmount = 0;
let expensesAmount = 0;
let incomeAmount = 0;

// Getting the user id from localStorage
const userID = JSON.parse(localStorage.getItem("userID"));

// Initializing the database
const database = new Database("http://localhost:5000");

// Initializing the elements
const elements = new Elements();

// Getting the user information based on the userID
database.fetchData(`users/${userID}`).then(res => {
    if (res?.message === "Could not find user" || res === undefined) {
        errorBanner.style.display = "flex"
        greetText.innerText = "Welcome, username"
        return
    }

    errorBanner.style.display = "none" // Removes the banner for unautheticated users
    greetText.innerText = `Welcome, ${res?.data.name.toLowerCase()}`
    bannerMotivation.innerText = `${res?.data.motivation}`

    // Displaying the income amounts on the ui and calculating the incomeAmount
    if (res?.data.income.length > 0) {
        getIncomeContainer.innerHTML = "";
        res?.data.income.map(income => {
            const cont = elements.createInfoElement("income", "+", income, "income", "INCOME", "in")
            getIncomeContainer.appendChild(cont);
            incomeAmount += income;
        })
    }

    // Displaying the expenses amounts on the ui and calculating the expensesAmount
    if (res?.data.expenses.length > 0) {
        getExpensesContainer.innerHTML = "";
        res?.data.expenses.map(expense => {
            const cont = elements.createInfoElement("expenses", "-", expense.amount, `${expense.expenseType.toLowerCase()}`, `${expense.expenseType.toUpperCase()}`, "out");
            getExpensesContainer.appendChild(cont);
            expensesAmount += expense.amount;
        })
    }

    budgetAmount = res?.data.budgetAmount; // Update the budget amount

    // Updating and display the users performance
    let percentagePerformance = Math.floor((expensesAmount / budgetAmount) * 100);
    console.log(percentagePerformance)
    if (percentagePerformance > 0 && percentagePerformance < 50) {
        const messages = {
            id: userID,
            advice: "If you keep on moving in this pace you will financially stress free, keep on spending less.",
            motivation: "You are moving on the right track"
        }
        database.postData("users/messages/update", messages)
    }
    if (percentagePerformance >= 50 && percentagePerformance < 80) {
        const messages = {
            id: userID,
            advice: "Please slow dowm on the expenses in order to stay on budget, do not spend too much.",
            motivation: "Please be carefull on your expenses"
        }
        database.postData("users/messages/update", messages)
    }
    if (percentagePerformance >= 80 && percentagePerformance < 100) {
        const messages = {
            id: userID,
            advice: "You have reached the peak of your budget, decrease on the expenses.",
            motivation: "You are spending too much, slow down."
        }
        database.postData("users/messages/update", messages)
    }
    if (percentagePerformance === 100) {
        const messages = {
            id: userID,
            advice: "Please add more income or increase your budget because you have blown it.",
            motivation: "You have reached budget max."
        }
        database.postData("users/messages/update", messages)
    }
})

/*
Add tab
- Tracking whether selected income or expense
*/
const getSelectBox = document.querySelector(".main_add_select")
const getSelectBoxText = document.querySelector(".main_add_select_text")
const getOptionsContainer = document.querySelector(".main_add_options")
const getOption = document.querySelectorAll(".main_add_option")
const getExpenseContainer = document.querySelector(".main_add_expense_select_container")

let selectedType = ""
let selectedExpense = ""

getOptionsContainer.style.display = "none"
getExpenseContainer.style.display = "none";

getSelectBox.addEventListener("click", () => {
    getOptionsContainer.style.display = "flex"
})

getOption.forEach(option => {
    const optionText = option.querySelector(".main_add_option_text")
    optionText.addEventListener("click", () => {
        getSelectBoxText.innerText = optionText.innerText;
        selectedType = optionText.innerText;
        getOptionsContainer.style.display = "none";
        if (getSelectBoxText.innerText === "Expense") {
            getExpenseContainer.style.display = "flex";
        } else {
            getExpenseContainer.style.display = "none";
        }
    })
})

/*
Add tab
- Tracking which expense the user has selected
*/
const getExpenseSelectBox = document.querySelector(".main_add_expense_select")
const getExpenseSelectBoxText = document.querySelector(".main_add_expense_select_text")
const getExpenseOptionsContainer = document.querySelector(".main_add_expense_options")
const getExpenseOption = document.querySelectorAll(".main_add_expense_option")

getExpenseOptionsContainer.style.display = "none";

getExpenseSelectBox.addEventListener("click", () => {
    getExpenseOptionsContainer.style.display = "flex"
})

getExpenseOption.forEach(optione => {
    const optionExpenseText = optione.querySelector(".main_add_expense_option_text")
    optionExpenseText.addEventListener("click", () => {
        getExpenseSelectBoxText.innerText = optionExpenseText.innerText;
        selectedExpense = optionExpenseText.innerText;
        getExpenseOptionsContainer.style.display = "none";
    })
})

// Info toggle Tab Bar
const getIncomeLink = document.querySelector(".income");
const getExpensesLink = document.querySelector(".expenses");
const getBudgetLink = document.querySelector(".budget");
const getAddLink = document.querySelector(".add");

getIncomeLink.classList.add("active")
let activeLink = getIncomeLink.innerText;

getIncomeContainer.style.display = "flex";
getExpensesContainer.style.display = "none";
getBudgetContainer.style.display = "none";
getAddContainer.style.display = "none";

getIncomeLink.addEventListener("click", () => {
    getIncomeLink.classList.add("active")
    getExpensesLink.classList.remove("active")
    getBudgetLink.classList.remove("active")
    getAddLink.classList.remove("active")

    getIncomeContainer.style.display = "flex";
    getExpensesContainer.style.display = "none";
    getBudgetContainer.style.display = "none";
    getAddContainer.style.display = "none";

    activeLink = getIncomeLink.innerText;
})

getExpensesLink.addEventListener("click", () => {
    getIncomeLink.classList.remove("active")
    getExpensesLink.classList.add("active")
    getBudgetLink.classList.remove("active")
    getAddLink.classList.remove("active")

    getIncomeContainer.style.display = "none";
    getExpensesContainer.style.display = "flex";
    getBudgetContainer.style.display = "none";
    getAddContainer.style.display = "none";

    activeLink = getExpensesLink.innerText;
})

getBudgetLink.addEventListener("click", () => {
    getIncomeLink.classList.remove("active")
    getExpensesLink.classList.remove("active")
    getBudgetLink.classList.add("active")
    getAddLink.classList.remove("active")

    getIncomeContainer.style.display = "none";
    getExpensesContainer.style.display = "none";
    getBudgetContainer.style.display = "flex";
    getAddContainer.style.display = "none";

    activeLink = getBudgetLink.innerText;
})

getAddLink.addEventListener("click", () => {
    getIncomeLink.classList.remove("active")
    getExpensesLink.classList.remove("active")
    getBudgetLink.classList.remove("active")
    getAddLink.classList.add("active")

    getIncomeContainer.style.display = "none";
    getExpensesContainer.style.display = "none";
    getBudgetContainer.style.display = "none";
    getAddContainer.style.display = "flex";

    activeLink = getAddLink.innerText;
})

// Error Handling on the Add Tab and updating the database
const budgetButton = document.querySelector(".main_budget_button");
const budgetError = document.querySelector(".main_budget_error");
const budgetInput = document.querySelector(".main_budget_input");
const addTypeContainer = document.querySelector(".main_add_select");

const addError = document.querySelector(".main_add_error");
const addButton = document.querySelector(".main_add_button");
const addInput = document.querySelector(".main_add_input");
const expenseTypeContainer = document.querySelector(".main_add_expense_select");

const formValidate = new FormValidate();

budgetButton.addEventListener("click", () => {
    if (!budgetInput.value) {
        formValidate.presentInvalidError(budgetInput, budgetError, "Please enter an amount")
        return
    }
    formValidate.removeErrorPresentation(budgetInput, budgetError);
    
    if (parseInt(budgetInput.value) >= incomeAmount) {
        formValidate.presentInvalidError(budgetInput, budgetError, `Budget ₹${parseInt(budgetInput.value)} cannot exceed ₹${incomeAmount} income`)
        return
    }
    formValidate.removeErrorPresentation(budgetInput, budgetError);

    const info = {
        id: userID,
        amount: parseInt(budgetInput.value)
    }

    database.postData("users/budget/update", info).then(res => {
        if (res?.message === "Failed to update budget") {
            budgetError.innerText = "Create account to add budget"
            return
        }
        budgetError.innerText = "";
        alert("Budget updated successfully")
        window.location.reload();
    }).catch(() => {
        budgetError.innerText = "Server error, please try again"
        return
    })
})

addButton.addEventListener("click", () => {
    if (selectedType === "") {
        formValidate.presentInvalidError(addTypeContainer, addError, "Please choose a type")
        return
    } else {
        formValidate.removeErrorPresentation(addTypeContainer, addError)
    }

    if (selectedType === "Expense") {
        if (selectedExpense === "") {
            formValidate.presentInvalidError(expenseTypeContainer, addError, "Please choose expense type")
            return
        } else {
            formValidate.removeErrorPresentation(expenseTypeContainer, addError)
        }
        
        if (!addInput.value) {
            formValidate.presentInvalidError(addInput, addError, "Please enter amount")
            return
        } else {
            formValidate.removeErrorPresentation(addInput, addError)
        }

        parseInt()
        if ((expensesAmount + parseInt(addInput.value)) > budgetAmount) {
            formValidate.presentInvalidError(addInput, addError, `Adding ₹${parseInt(addInput.value)} will exceed the budget ₹${budgetAmount}`)
            return
        } else {
            formValidate.removeErrorPresentation(addInput, addError);
        }

        const info = {
            id: userID,
            expenseType: selectedExpense,
            amount: parseInt(addInput.value)
        }

        database.postData("users/expenses/add", info).then(res => {
            if (res?.message === "Could not add expense") {
                addError.innerText = "Create account to add expense"
                return 
            }
            addError.innerText = "";
            alert("Expense added successfully");
            window.location.reload();
        }).catch(() => {
            addError.innerText = "Server error, please try again"
            return
        })
    } 
    else {
        if (!addInput.value) {
            formValidate.presentInvalidError(addInput, addError, "Please enter amount")
            return
        } else {
            formValidate.removeErrorPresentation(addInput, addError)
        }
        
        const info = {
            id: userID,
            amount: parseInt(addInput.value)
        }

        database.postData("users/income/add", info).then(res => {
            if (res?.message === "Could not add income") {
                addError.innerText = "Create account to add income"
                return
            }
            addError.innerText = "";
            alert("Income addded successfully")
            window.location.reload();
        }).catch(() => {
            addError.innerText = "Server error, please try again"
            return
        })
    }
})