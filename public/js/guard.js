(function() {
    var user = localStorage.getItem("loggedInUser");
    if (!user) {
        window.location.href = "login.html";
    }
})();
