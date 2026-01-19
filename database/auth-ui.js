import {
    auth
} from "/database/config.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


let mode = "login";
const switchText = document.getElementById("authSwitchText");

window.switchAuth = function (type) {
    mode = type;

    const nameField = document.getElementById("authName");
    const switchText = document.querySelector(".auth-switch-text");
    const authTitle = document.getElementById("authTitle");

    if (type === "login") {
        clearError();
        authTitle.innerText = "Welcome Back";
        nameField.style.display = "none";
        switchText.innerHTML =
            `Belum punya akun? <span onclick="switchAuth('register')">Register</span>`;
    } else {
        clearError();
        authTitle.innerText = "Create Account";
        nameField.style.display = "block";
        switchText.innerHTML =
            `Sudah punya akun? <span onclick="switchAuth('login')">Login</span>`;
    }
};

window.submitAuth = async function () {

    const email = authEmail.value.trim();
    const pass  = authPassword.value.trim();
    const name  = authName.value.trim();

    clearError();

    if(!email || !email.includes("@") || !email.includes(".")){
        markEmailError("Format email tidak valid.");
        return;
    }

    /* VALIDASI PASSWORD */
    if(pass.length < 6){
        markPassError("Password minimal 6 karakter.");
        return;
    }

    if(mode === "register" && name.length === 0){
        markNameError("Nama tidak boleh kosong.");
        return;
    }

    try{

        if(mode === "login"){

            await signInWithEmailAndPassword(auth, email, pass);
            showAuthSuccess("Login Successful", "Welcome back to MRADIO");

        }else{

            const userCred = await createUserWithEmailAndPassword(auth, email, pass);

            await updateProfile(userCred.user, {
                displayName: name
            });

            showAuthSuccess("Account Created", "Your MRADIO account is ready");
        }

    }catch(err){

        if(err.code === "auth/invalid-credential"){
            markPassError("Email atau password salah.");

        }else if(err.code === "auth/email-already-in-use"){
            markEmailError("Email sudah digunakan.");

        }else if(err.code === "auth/weak-password"){
            markPassError("Password terlalu lemah.");

        }else if(err.code === "auth/invalid-email"){
            markEmailError("Email tidak valid.");

        }else if(err.code === "auth/operation-not-allowed"){
            showError("Metode login belum diaktifkan di Firebase.");

        }else if(err.code === "auth/too-many-requests"){
            showError("Terlalu banyak percobaan. Coba lagi nanti.");

        }else{
            showError("Gagal membuat akun.");
        }

        console.error("Auth Error:", err);
    }
};

window.loginWithGoogle = async function () {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: "select_account"
    });

    await signInWithPopup(auth, provider);
    showAuthSuccess("Google Login Success", "Connected with your Google account");
};

function showAuthSuccess(title, detail) {
    const box = document.querySelector(".auth-box");

    box.innerHTML = `
    <div class="auth-success">
        <i class="fa-solid fa-circle-check"></i>
        <h4>${title}</h4>
        <p>${detail}</p>
    </div>
  `;

    setTimeout(() => {
        closeAuthModal();
        window.location.href = "/";
    }, 1000);
}

function markNameError(msg){
  authName.classList.add("input-error");
  showError(msg);

  authName.addEventListener("input", ()=>{
    clearError();
  }, {once:true});
}

function markEmailError(msg){
  authEmail.classList.add("input-error");
  showError(msg);

  authEmail.addEventListener("input", ()=>{
    clearError();
  }, {once:true});
}

function markPassError(msg){
  authPassword.classList.add("input-error");
  showError(msg);

  authPassword.addEventListener("input", ()=>{
    clearError();
  }, {once:true});
}

function showError(message) {
    const errBox = document.getElementById("authError");
    errBox.textContent = message;
}

function clearError(){
    authPassword.classList.remove("input-error");
    authEmail.classList.remove("input-error");
    authName.classList.remove("input-error");
    authError.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const pass = document.getElementById("authPassword");
    const eye = document.getElementById("togglePass");

    if (eye) {
        eye.addEventListener("click", () => {
            if (pass.type === "password") {
                pass.type = "text";
                eye.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                pass.type = "password";
                eye.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    }
});