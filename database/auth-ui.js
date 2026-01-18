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
        authTitle.innerText = "Welcome Back";
        nameField.style.display = "none";
        switchText.innerHTML =
            `Belum punya akun? <span onclick="switchAuth('register')">Register</span>`;
    } else {
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

    try{

        if(!email || !email.includes("@") || !email.includes(".")){
            markError();
            showError("Please enter a valid email.");
            return;
        }

        if(pass.length < 6){
            markError();
            showError("Password must be at least 6 characters.");
            return;
        }

        if (mode === "login") {
            await signInWithEmailAndPassword(auth, email, pass);
            showAuthSuccess("Login Successful", "Welcome back to MRADIO");

        } else {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);

            if (name) {
                await updateProfile(userCred.user, { displayName: name });
            }
            showAuthSuccess("Account Created", "Your MRADIO account is ready");
        }

    }catch(err){
        markError();

        if(err.code === "auth/invalid-credential"){
            showError("Email atau password salah.");
        }else if(err.code === "auth/email-already-in-use"){
            showError("Email sudah terdaftar.");
        }else{
            showError("Gagal melakukan autentikasi.");
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

function markError(){
  const email = document.getElementById("authEmail");
  const pass  = document.getElementById("authPassword");

  email.classList.add("input-error");
  pass.classList.add("input-error");

  email.addEventListener("input", ()=>email.classList.remove("input-error"), {once:true});
  pass.addEventListener("input", ()=>pass.classList.remove("input-error"), {once:true});
}

function showError(message){
  const errBox = document.getElementById("authError");
  errBox.textContent = message;
}

function clearError(){
  const errBox = document.getElementById("authError");
  errBox.textContent = "";
}

document.addEventListener("DOMContentLoaded",()=>{
  const pass = document.getElementById("authPassword");
  const eye  = document.getElementById("togglePass");

  if(eye){
    eye.addEventListener("click",()=>{
      if(pass.type === "password"){
        pass.type = "text";
        eye.classList.replace("fa-eye","fa-eye-slash");
      }else{
        pass.type = "password";
        eye.classList.replace("fa-eye-slash","fa-eye");
      }
    });
  }
});

