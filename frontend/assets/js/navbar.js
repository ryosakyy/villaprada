fetch("../assets/components/navbar_admin.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("navbar-container").innerHTML = html;
    });