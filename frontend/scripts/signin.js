import {FormValidate} from "../utils/validate.js";
import Database from "../utils/database.js";

const emailInput = document.querySelector(".email")
const passwordInput = document.querySelector(".password")
const submitButton = document.body.querySelector(".submit_form")
const errorMessage = document.querySelector(".error_message")

submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const valid = new FormValidate("", emailInput.value, passwordInput.value, "");

    const userInfo = {
        email: emailInput.value,
        password: passwordInput.value
    }

    if (!valid.isValidEmail(userInfo.email)) {
        valid.presentInvalidError(emailInput, errorMessage, "Please enter your email")
        return
    } else {
        valid.removeErrorPresentation(emailInput, errorMessage);
    }
    
    if (!valid.isAcceptableEmail(userInfo.email)) {
        valid.presentInvalidError(emailInput, errorMessage, "Please enter a valid email")
        return
    } else {
        valid.removeErrorPresentation(emailInput, errorMessage);
    }

    if (!valid.isValidPassword(userInfo.password)) {
        valid.presentInvalidError(passwordInput, errorMessage, "Please enter your password")
        return
    } else {
        valid.removeErrorPresentation(passwordInput, errorMessage);
    }
    const database = new Database("http://localhost:5000")
    database.fetchData("users/login").then(res => {
        const dataArray = res?.data?.filter(item => item.email === userInfo.email && item.password === userInfo.password)
        if (dataArray.length === 0) {
            errorMessage.innerText = "User not found, try creating an account";
        } else {
            errorMessage.innerText = "";
            localStorage.setItem("userID", JSON.stringify(dataArray[0]?._id))
            window.location.href = "http://127.0.0.1:5500/frontend/src/pages/home.html"
        }
    }).catch(() => {
        errorMessage.innerText = "Server error, please try again"
        return
    })
})