document.addEventListener('DOMContentLoaded', function() {
    let loisirs = [];
    let uploadedPhotoUrl = null; // URL Cloudinary de la photo

    // ============= GESTION DES LOISIRS =============
    document.getElementById("loisirs").addEventListener("change", function(){
        let a = document.getElementById("loisirs").value;
        if (!loisirs.find(item => item == a)) {
            let chip = document.createElement("div");
            chip.setAttribute("class", "loisirs-chip");
            chip.innerHTML = `${a} <button type="button" id='${a}'>X</button>`;
            
            document.getElementById("loisirs-box").appendChild(chip);
            document.getElementById(`${a}`).addEventListener("click", function(){
                loisirs = loisirs.filter(item => item !== a);
                chip.remove();
            });
            loisirs.unshift(a);
        }
    });

    // ============= GESTION DE LA PHOTO =============
    
    // Click sur la box pour ouvrir le sélecteur
    document.getElementById("pp-box").addEventListener("click", function(){
        document.getElementById("pp").click();
    });

    // Quand une photo est sélectionnée
    document.getElementById("pp").addEventListener("change", async function(e){
        const file = e.target.files[0];
        
        if (!file) return;

        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            alert('❌ Veuillez sélectionner une image (JPG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('❌ L\'image est trop grande (max 5MB)');
            return;
        }

        // ===== PRÉVISUALISATION =====
        const preview = document.querySelector('.paspp');
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.width = '150px';
            preview.style.height = '150px';
            preview.style.objectFit = 'cover';
        };
        reader.readAsDataURL(file);

        // ===== UPLOAD VERS CLOUDINARY =====
        try {
            console.log('📤 Upload de la photo en cours...');
            
            // Créer FormData pour l'upload
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch('/api/upload/profile', {
                method: 'POST',
                credentials: 'include',
                body: formData // Pas de Content-Type header, FormData le gère
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            const data = await response.json();
            uploadedPhotoUrl = data.url;
            
            console.log('✅ Photo uploadée avec succès:', uploadedPhotoUrl);
            
            // Notification visuelle
            const imageBox = document.getElementById('pp-box');
            imageBox.style.borderColor = '#10b981';
            setTimeout(() => {
                imageBox.style.borderColor = '#ebecee';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erreur upload:', error);
            alert('Erreur lors de l\'upload de la photo: ' + error.message);
            uploadedPhotoUrl = null;
        }
    });

    // ============= DRAG & DROP (BONUS) =============
    const dropZone = document.getElementById('pp-box');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#8C24F3';
        dropZone.style.backgroundColor = '#f0e6ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ebecee';
        dropZone.style.backgroundColor = 'white';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ebecee';
        dropZone.style.backgroundColor = 'white';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            // Simuler la sélection
            const input = document.getElementById('pp');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Déclencher l'événement change
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // ============= SOUMISSION DU FORMULAIRE =============
    document.getElementById("continuer").addEventListener("click", async function(e){
        e.preventDefault();

        // Validation de la photo
        if (!uploadedPhotoUrl) {
            alert('❌ Veuillez uploader une photo de profil');
            return;
        }

        // Récupérer les données du localStorage
        let loggingUser = JSON.parse(localStorage.getItem("currentlyLoggingUser"));
        
        if (!loggingUser) {
            alert('❌ Erreur: Informations utilisateur manquantes');
            window.location.href = 'inscription.html';
            return;
        }

        // Récupérer les données du formulaire
        let dateNaissance = document.getElementById("birthdate").value;
        let sexe = document.getElementById("sexe").value;
        let intention = document.getElementById("intention").value;
        let bio = document.getElementById("bio").value;
        let religion = document.getElementById("religion").value;
        let ethnie = document.getElementById("ethnies").value;
        let localisation = document.getElementById("ecoles").value;

        // Validation des champs requis
        if (!dateNaissance || !sexe || !intention) {
            alert('❌ Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Préparer les données
        const data = {
            nom: loggingUser.nom,
            email: loggingUser.email,
            password: loggingUser.password,
            dateNaissance: dateNaissance,
            genre: sexe,
            intention: intention,
            bio: bio,
            photos: [uploadedPhotoUrl], // ✅ URL Cloudinary
            religion: religion,
            ethnie: ethnie,
            localisation: localisation,
            interets: loisirs
        };

        try {
            console.log('📤 Envoi des données au serveur...');
            console.log('Données:', data);

            // Désactiver le bouton pendant l'envoi
            const btn = document.getElementById("continuer");
            const originalText = btn.textContent;
            btn.textContent = '⏳ Création en cours...';
            btn.disabled = true;

            const response = await fetch('https://nexus-api-ill3.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Inscription réussie:', responseData);
                
                // Sauvegarder l'utilisateur connecté
                localStorage.setItem("loggedInUser", JSON.stringify(responseData));
                
                // Nettoyer les données temporaires
                localStorage.removeItem("currentlyLoggingUser");
                
                // Redirection
                alert('🎉 Compte créé avec succès! Bienvenue sur Concordia.');
                window.location.href = 'decouverte_filtre.html';
            } else {
                console.error('❌ Erreur serveur:', responseData);
                alert('❌ Erreur: ' + (responseData.message || 'Inscription échouée'));
                
                // Réactiver le bouton
                btn.textContent = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            alert('❌ Erreur de connexion au serveur. Veuillez réessayer.');
            
            // Réactiver le bouton
            const btn = document.getElementById("continuer");
            btn.textContent = 'Continuer';
            btn.disabled = false;
        }
    });
});