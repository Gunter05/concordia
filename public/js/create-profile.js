
document.addEventListener('DOMContentLoaded', function() {
    let loisirs= [];

    document.getElementById("loisirs").addEventListener("change", function(){
        let a= document.getElementById("loisirs").value;
        if(!loisirs.find(item => item == a)){
            let chip= document.createElement("div");
            chip.setAttribute("class", "loisirs-chip");
            chip.innerHTML = `${a} <button id='${a}'>X</button>`;
            
            document.getElementById("loisirs-box").appendChild(chip);
            document.getElementById(`${a}`).addEventListener("click", function(){
                loisirs= loisirs.filter(item => item !== a);
                chip.remove();
            });
            loisirs.unshift(a);
        }
    });

    document.getElementById("pp-box").addEventListener("click",function(){
        let pp= document.getElementById("pp");
        pp.click();
    });

    document.getElementById("continuer").addEventListener("click", function(){

        let loggingUser= JSON.parse(localStorage.getItem("currentlyLoggingUser"));

        var xhr = new XMLHttpRequest();

        xhr.open("POST", "https://nexus-api-ill3.onrender.com/api/auth/register", true);

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.withCredentials= true;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) { // 4 = DONE
                if (xhr.status === 201) {
                    // Succès : traiter la réponse
                    console.log("Réponse du serveur :", xhr.responseText);
                    
                    console.log("responsetext: " + xhr.responseText);
                    console.log("response: " + xhr.response);
                    localStorage.setItem("loggedInUser", xhr.response);
                    window.location.href= "decouverte.html";
                } else {
                    // Erreur
                    console.error("Erreur :", xhr.status, xhr.statusText);
                }
            }
        };
        let dateNaissance= document.getElementById("birthdate").value;
        let sexe= document.getElementById("sexe").value;
        let intention= document.getElementById("intention").value;
        let bio= document.getElementById("bio").value;
        let photos= document.getElementById("pp").files[0];
        let religion= document.getElementById("religion").value;
        let ethnie= document.getElementById("ethnies").value;
        let localisation= document.getElementById("ecoles").value;
        let interets = loisirs;
        var data = {
            nom: loggingUser["nom"],
            email: loggingUser["email"],
            password: loggingUser["password"],
            dateNaissance: dateNaissance,
            genre: sexe,
            intention: intention,
            bio: bio,
            photos: [photos["name"]],
            religion: religion,
            ethnie: ethnie,
            localisation: localisation,
            interets: interets
        };

        // Envoi de la requête avec les données converties en JSON
        xhr.send(JSON.stringify(data));
    });

});