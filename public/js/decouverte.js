document.addEventListener("DOMContentLoaded", function() {
    fetch('https://nexus-api-ill3.onrender.com/api/users/') // Mets ici l'URL de ton API
        .then(response => response.json())
        .then(users => {
            const stack = document.getElementById("stack");
            stack.innerHTML = ""; // Vide les cartes existantes
            console.log(users);
            users.forEach(user => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <div class="image-box">
                        <span class="badge left" style="color: white;">${user.relation || "Relation sérieuse"}</span>
                        <img src="${user.photo || './images/default.jpg'}" alt="Profil">
                        <span class="badge bottomleft">
                            <h2 style="color: white;">${user.nom}, ${user.age || ""}</h2>
                            <p class="info" style="color: white;">${user.profession || ""}</p>
                            <p class="info" style="color: white;">${user.ville || ""} ${user.distance ? "à " + user.distance + "km" : ""}</p>
                        </span>
                    </div>
                    <div class="content">
                        <p class="bio">
                            ${user.bio || ""}
                        </p>
                        <div class="tags">
                            <span>${user.interet || ""}</span>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn cancel"><i class="fa-solid fa-xmark"></i></button>
                        <button class="btn info"><i class="fa-solid fa-circle-info"></i></button>
                        <button class="btn like"><i class="fa-solid fa-heart"></i></button>
                    </div>
                `;
                stack.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erreur lors du chargement des utilisateurs :", error);
        });
});

function rotate(direction) {
    const stack = document.getElementById("stack");
    const cards = stack.querySelectorAll(".card");

    if (cards.length < 2) return;
    let topCard;
    topCard = cards[cards.length - 1];

    if(direction == -1){
        
        topCard.style.transform = `translateX(${direction * 400}px) rotate(${direction * 20}deg)`;
        topCard.style.opacity = "0";
        setTimeout(() => {
            topCard.style.transform = "";
            topCard.style.opacity = "1";
            topCard.remove();
        }, 600);
    }
    else{

        topCard.style.transform = `translateX(${direction * 400}px) rotate(${direction * 20}deg)`;
        topCard.style.opacity = "0";

        setTimeout(() => {
            topCard.style.transform = "";
            topCard.style.opacity = "1";
            stack.prepend(topCard);

        }, 600);
    }

    // animation
    
}