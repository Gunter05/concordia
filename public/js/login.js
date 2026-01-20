

function load(){
let login= true;
    document.getElementById("inscription").addEventListener("click",function(){
        document.getElementById("signup-hero").classList.toggle("signup-hero-activated");
        document.getElementById("signup-hero").classList.toggle("signup-hero");
        
        document.getElementById("auth").classList.toggle("auth-signup");
        document.getElementById("auth").classList.toggle("auth");

        document.getElementById("hero-signin").classList.toggle("hero");
        document.getElementById("hero-signin").classList.toggle("hero-deactivated");
        
        document.getElementById("name-field").classList.toggle("name-field-deactivated");
        document.getElementById("name-field").classList.toggle("form-group");

        if(login){
            login= false;
            document.getElementById("auth-title").innerHTML= "Rejoignez la communauté Nexus"
            document.getElementById("login-btn").innerHTML= "S'inscrire"
        }
        else{
            login= true;
            document.getElementById("auth-title").innerHTML= "Bon retour"   
            document.getElementById("login-btn").innerHTML= "Se connecter"   
        }
        
    });

    document.getElementById("login-btn").addEventListener("click", function(){
        if(login){
            var xhr = new XMLHttpRequest();

            xhr.open("POST", "https://nexus-api-ill3.onrender.com/api/auth/login", true);

            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.withCredentials= true;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) { // 4 = DONE
                    if (xhr.status === 200) {
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
            
            var data = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
            };

            // Envoi de la requête avec les données converties en JSON
            xhr.send(JSON.stringify(data));
        }
        else{
            let user={
                "nom": document.getElementById("name").value,
                "email": document.getElementById("email").value,
                "password": document.getElementById("password").value,
            };
            localStorage.setItem("currentlyLoggingUser", JSON.stringify(user));
            window.location.href = "create_profile.html";
        }
    });

}