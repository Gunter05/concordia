// Fonction pour upload UNE photo
async function uploadPhoto(file) {
    try {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch('/api/upload/profile', {
            method: 'POST',
            credentials: 'include',
            body: formData // Pas de Content-Type, FormData le gère
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload réussi:', data.url);
        return data.url;
    } catch (error) {
        console.error('Erreur upload:', error);
        throw error;
    }
}

// Fonction pour upload PLUSIEURS photos
async function uploadMultiplePhotos(files) {
    try {
        const formData = new FormData();
        
        // Ajouter chaque fichier
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        const response = await fetch('/api/upload/photos', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload réussi:', data.urls);
        return data.urls;
    } catch (error) {
        console.error('Erreur upload:', error);
        throw error;
    }
}

// Prévisualiser une image avant upload
function previewImage(file, imgElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imgElement.src = e.target.result;
    };
    reader.readAsDataURL(file);
}