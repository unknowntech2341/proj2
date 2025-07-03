import Database from "../utils/database.js";

// Getting the HTML Elements for manipulation
const errorBanner = document.querySelector(".main_auth_error");
const greetText = document.querySelector(".main_banner_header_text");
const getCanvas = document.querySelector(".main_spendings_container_data");
const bannerMotivation = document.querySelector(".main_banner_text");
const incomeAmount = document.querySelector(".main_account_container_income");
const expensesAmount = document.querySelector(".main_account_container_expense");
const budgetIndicator = document.querySelector(".main_budget_content_graph_indicator");
const adviceText = document.querySelector(".account_advice_text");
const budgetAmountText = document.querySelector(".main_budget_container_month");

budgetIndicator.style.width = "0%"; // Initialize the budget indicator

// Data that will be used by the graph
let representationData = [1, 1, 1, 1, 1, 1];

// Getting the user id from localStorage
const userID = JSON.parse(localStorage.getItem("userID"));

// Initializing the database
const database = new Database("http://localhost:5000")

// Function to draw bar chart
function drawBarChart(dataArray) {
  const data = {
    labels: ['Fees', 'Entertainment', 'Clothing', 'Rent', 'Water', 'Electricity'],
    datasets: [{
      label: "Expenses",
      data: dataArray,
      backgroundColor: [
        'rgb(236, 154, 0)',
        'rgb(0, 201, 0)',
        'rgb(96, 0, 160)',
        'rgb(0, 216, 245)',
        'rgb(223, 0, 0)',
        'rgb(0, 119, 231)'
      ],
      borderRadius: 5
    }]
  };

  new Chart(getCanvas, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Expense Breakdown'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Getting the user information based on the userID
database.fetchData(`users/${userID}`).then(res => {
  if (res?.message === "Could not find user" || res === undefined) {
    errorBanner.style.display = "flex";
    greetText.innerText = "Welcome, username";

    // Show dummy bar chart
    drawBarChart(representationData);
    return;
  }

  // User found
  errorBanner.style.display = "none";
  greetText.innerText = `Welcome, ${res?.data.name.toLowerCase()}`;
  bannerMotivation.innerText = `${res?.data.motivation}`;
  adviceText.innerText = `${res?.data.advice}`;
  budgetAmountText.innerText = `₹${res?.data.budgetAmount}`;

  let incomeSum = 0;
  let expensesSum = 0;
  let budgetAmount = 0;

  if (res?.data.income.length > 0) {
    res?.data.income.forEach(income => {
      incomeSum += income;
    });
    res?.data.expenses.forEach(expense => {
      expensesSum += expense?.amount;
    });
  }

  if (res?.data.expenses.length > 0) {
    expensesSum = 0;
    res?.data.expenses.forEach(expense => {
      expensesSum += expense?.amount;
    });

    // Update chart data
    representationData = [
      res.data.expenses.filter(e => e.expenseType === "Food").length,
      res.data.expenses.filter(e => e.expenseType === "Entertainment").length,
      res.data.expenses.filter(e => e.expenseType === "Clothing").length,
      res.data.expenses.filter(e => e.expenseType === "Rent").length,
      res.data.expenses.filter(e => e.expenseType === "Water").length,
      res.data.expenses.filter(e => e.expenseType === "Electricity").length
    ];

    drawBarChart(representationData);

  } else {
    drawBarChart(representationData);
  }

  // Update UI
  incomeAmount.innerText = `₹${incomeSum}`;
  expensesAmount.innerText = `₹${expensesSum}`;
  budgetAmount = res?.data.budgetAmount;

  // Update performance bar
  let percentagePerformance = Math.floor((expensesSum / budgetAmount) * 100);
  budgetIndicator.style.width = `${percentagePerformance}%`;

  // Set color and message
  const updateMessage = (advice, motivation, color) => {
    const messages = { id: userID, advice, motivation };
    database.postData("users/messages/update", messages).then(() => {
      budgetIndicator.style.backgroundColor = color;
    });
  };

  if (percentagePerformance > 0 && percentagePerformance < 50) {
    updateMessage(
      "If you keep on moving in this pace you will financially stress free, keep on spending less.",
      "You are moving on the right track",
      "rgb(0, 201, 0)"
    );
  } else if (percentagePerformance >= 50 && percentagePerformance < 80) {
    updateMessage(
      "Please slow down on the expenses in order to stay on budget, do not spend too much.",
      "Please be careful on your expenses",
      "rgb(0, 119, 231)"
    );
  } else if (percentagePerformance >= 80 && percentagePerformance < 100) {
    updateMessage(
      "You have reached the peak of your budget, decrease on the expenses.",
      "You are spending too much, slow down.",
      "rgb(236, 154, 0)"
    );
  } else if (percentagePerformance === 100) {
    updateMessage(
      "Please add more income or increase your budget because you have blown it.",
      "You have reached budget max.",
      "rgb(223, 0, 0)"
    );
  }
});
