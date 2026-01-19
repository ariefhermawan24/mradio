import {
  auth
} from "/database/config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("navbar-ready", () => {

  const navLogin = document.getElementById("navLogin");
  const navAvatar = document.getElementById("navAvatar");
  const navIcon = document.getElementById("navIcon");
  const navLabel = document.getElementById("navLabel");

  if (!navLogin) return;

  onAuthStateChanged(auth, (user) => {

    if (user) {
      const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`;
      navAvatar.style.display = "block";
      navIcon.style.display = "none";
      navAvatar.src = avatar;
      navLabel.textContent = user.displayName || user.email;
      navLogin.href = "#";
      navAvatar.style.display = "block";
      navIcon.style.display = "none";
      navLabel.textContent = user.displayName || user.email;

      dropAvatar.src = avatar;
      dropName.textContent = user.displayName || "User";
      dropEmail.textContent = user.email;

      navLogin.onclick = (e) => {
        e.preventDefault();

        if (navDropdown.classList.contains("show")) {
          navDropdown.classList.remove("show");
          navDropdown.classList.add("hide");

          setTimeout(() => navDropdown.classList.remove("hide"), 200);
        } else {
          navDropdown.classList.remove("hide");
          navDropdown.classList.add("show");
        }
      };

      logoutBtn.onclick = (e) => {
  e.preventDefault();

  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to continue logout?",
    icon: "warning",
    background: "#0b0b0b",
    color: "white",
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#444",
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
    showCancelButton: true
  }).then(async (result) => {

    if(result.isConfirmed){

        await auth.signOut();

        navDropdown.classList.remove("show");
        navDropdown.classList.add("hide");
        setTimeout(() => navDropdown.classList.remove("hide"), 200);

        const toastEl = document.getElementById("logoutToast");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

  });
};

    } else {
      navAvatar.style.display = "none";
      navIcon.style.display = "inline-block";
      navLabel.textContent = "Login";
      navLogin.href = "#";
      navLogin.onclick = () => openAuthModal();
    }

  });

});