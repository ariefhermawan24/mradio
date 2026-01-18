async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    const res = await fetch(file);
    const html = await res.text();
    el.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
    async function loadNavbar(){
    const res = await fetch("/component/navbar.html");
    const html = await res.text();
    document.getElementById("navbar-placeholder").innerHTML = html;

    /* beri sinyal navbar sudah siap */
    window.dispatchEvent(new Event("navbar-ready"));
    }

    loadNavbar();

});