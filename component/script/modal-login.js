fetch("/component/modal-login.html")
  .then(r=>r.text())
  .then(t=>{
    document.getElementById("modal-placeholder");
    window.dispatchEvent(new Event("auth-ready"));
  });