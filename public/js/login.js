

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