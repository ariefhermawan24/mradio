import { auth } from "/database/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("navbar-ready", () => {

  const navLogin  = document.getElementById("navLogin");
  const navAvatar = document.getElementById("navAvatar");
  const navIcon   = document.getElementById("navIcon");
  const navLabel  = document.getElementById("navLabel");

  if(!navLogin) return;

  onAuthStateChanged(auth, (user) => {

    if(user){
        navAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`;
        navAvatar.style.display = "block";
        navIcon.style.display = "none";
        navLabel.textContent = user.displayName || user.email;
        navLogin.href = "#";
    }else{
        navAvatar.style.display = "none";
        navIcon.style.display = "inline-block";
        navLabel.textContent = "Login";
        navLogin.href = "#";
        navLogin.onclick = () => openAuthModal();
    }

  });

});
