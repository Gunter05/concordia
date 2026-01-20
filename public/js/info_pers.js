let profile= JSON.parse(localStorage.getItem("profile"));

document.addEventListener("DOMContentLoaded", function(){
    initFields();
});

function initFields(){
    document.getElementById("nom").innerHTML = profile.nom;
}