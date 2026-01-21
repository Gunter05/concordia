let loggedInUser= JSON.parse(localStorage.getItem("loggedInUser"));

export function sendMessage(toUserId, messageText, callback) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://nexus-api-ill3.onrender.com/api/chat/send", true);
    
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.withCredentials= true;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // 4 = DONE
            if ((xhr.status === 200) || (xhr.status === 201)) {
                // Succès : traiter la réponse
                console.log("Réponse du serveur :", xhr.responseText);
                
                console.log("responsetext: " + xhr.responseText);
                console.log("response: " + xhr.response);
                if (callback) callback(xhr.response);
            } else {
                // Erreur
                console.error("Erreur :", xhr.status, xhr.statusText);
            }
        }
    };
    
    var data = { 
        senderId: loggedInUser._id,
        receiverId: toUserId,
        content: messageText
    };

    // Envoi de la requête avec les données converties en JSON
    xhr.send(JSON.stringify(data));
}

export function fetchMessages(withUserId, callback) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://nexus-api-ill3.onrender.com/api/chat/send", true);
    
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.withCredentials= true;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // 4 = DONE
            if ((xhr.status === 200) || (xhr.status === 201)) {
                // Succès : traiter la réponse
                console.log("Réponse du serveur :", xhr.responseText);
                
                console.log("responsetext: " + xhr.responseText);
                console.log("response: " + xhr.response);
                if (callback) callback(xhr.response);
            } else {
                // Erreur
                console.error("Erreur :", xhr.status, xhr.statusText);
            }
        }
    };
    
    var data = { 
        currentUserId: loggedInUser._id, 
        otherUserId: withUserId,
    };

    // Envoi de la requête avec les données converties en JSON
    xhr.send(JSON.stringify(data));
}

export function fetchConversations(callback){
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://nexus-api-ill3.onrender.com/api/chat/send", true);
    
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.withCredentials= true;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // 4 = DONE
            if ((xhr.status === 200) || (xhr.status === 201)) {
                // Succès : traiter la réponse
                console.log("Réponse du serveur :", xhr.responseText);
                
                console.log("responsetext: " + xhr.responseText);
                console.log("response: " + xhr.response);
                if (callback) callback(xhr.response);
            } else {
                // Erreur
                console.error("Erreur :", xhr.status, xhr.statusText);
            }
        }
    };
    
    var data = { 
        userId: loggedInUser._id,
    };

    // Envoi de la requête avec les données converties en JSON
    xhr.send(JSON.stringify(data));
}