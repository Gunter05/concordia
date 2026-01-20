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
});

function initFields(){
    document.getElementById("nom").innerHTML = profile.nom;
    document.getElementById("name-title").innerHTML = profile.nom;
    document.getElementById("location_user").innerHTML = profile.ville || "";
    document.getElementById("relation").innerHTML = profile.relation || "Relation sérieuse";
    document.getElementById("bio").innerHTML = profile.bio || "";
    for(let interest of profile.interet){
        document.getElementById("").innerHTML += `
            <div class="tag">
                <i class='${loisirsIcons[interest]}'></i>
                ${interest}
            </div>`;
    }
    
    if(profile.photos.lenght >= 2){
        for(let i=1; i < profile.photos.lenght; i++){
            document.getElementById("").innerHTML += `
                <li>
                    <img src="${profile.photos[i]}" alt="Photo galerie 1"/>
                </li>`;
        }
    }

    
}