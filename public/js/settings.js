let profile= JSON.parse(localStorage.getItem("profile"));
const loisirsIcons = {
  sport: "fa-solid fa-dumbbell",
  football: "fa-solid fa-futbol",
  basketball: "fa-solid fa-basketball",
  musique: "fa-solid fa-music",
  danse: "fa-solid fa-person-walking",
  cinema: "fa-solid fa-film",
  lecture: "fa-solid fa-book",
  ecriture: "fa-solid fa-pen",
  voyage: "fa-solid fa-plane",
  photographie: "fa-solid fa-camera",
  cuisine: "fa-solid fa-utensils",
  patisserie: "fa-solid fa-cake-candles",
  jeux_video: "fa-solid fa-gamepad",
  programmation: "fa-solid fa-code",
  dessin: "fa-solid fa-paintbrush",
  peinture: "fa-solid fa-palette",
  chant: "fa-solid fa-microphone",
  theatre: "fa-solid fa-masks-theater",
  fitness: "fa-solid fa-heart-pulse",
  yoga: "fa-solid fa-spa",
  meditation: "fa-solid fa-leaf",
  nature: "fa-solid fa-tree",
  jardinage: "fa-solid fa-seedling",
  bricolage: "fa-solid fa-hammer",
  shopping: "fa-solid fa-bag-shopping",
  mode: "fa-solid fa-shirt",
  rencontre: "fa-solid fa-heart",
  benevolat: "fa-solid fa-hands-helping"
};



document.addEventListener("DOMContentLoaded", function(){
    initFields();

    document.getElementById("info-update-submit").addEventListener("click", function(){
        var xhr = new XMLHttpRequest();

        xhr.open("PUT", `https://nexus-api-ill3.onrender.com/api/users/${profile._id}`, true);

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader('Authorization', `Bearer ${profile.token}`);
        xhr.withCredentials= true;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) { // 4 = DONE
                if (xhr.status === 200) {
                    // Succès : traiter la réponse
                    console.log("Réponse du serveur :", xhr.responseText);
                    
                    console.log("responsetext: " + xhr.responseText);
                    console.log("response: " + xhr.response);
                    localStorage.setItem("loggedInUser", xhr.response);
                    window.location.href= "settings.html";
                } else {
                    // Erreur
                    console.error("Erreur :", xhr.status, xhr.statusText);
                }
            }
        };
        
        var data = {
            "nom" : document.getElementById("full-name").value,
            "bio": document.getElementById("bio").value,
            "universite": document.getElementById("ecoles").value,
        };

        // Envoi de la requête avec les données converties en JSON
        xhr.send(JSON.stringify(data));
    });
});

function initFields(){
    document.getElementById("profile-name").innerHTML = profile.nom;
    document.getElementById("profile-status").innerHTML = profile.genre == 'femme' ? "Etudiante" : "Etudiant";
    document.getElementById("profile-age").innerHTML = profile.age || "";
    document.getElementById("email").innerHTML = profile.email || "eee@ee.com";
    document.getElementById("bio").innerHTML = profile.bio || "";

}