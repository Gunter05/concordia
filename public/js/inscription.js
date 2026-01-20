document.addEventListener('DOMContentLoaded', function() {
    // Fonctionnalité pour afficher/masquer le mot de passe
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
                this.setAttribute('aria-label', 'Masquer le mot de passe');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bx-show');
                icon.classList.add('bx-hide');
                this.setAttribute('aria-label', 'Afficher le mot de passe');
            }
        });
    }
    
    // Carrousel automatique
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const totalSlides = slides.length;
    
    function showSlide(index) {
        // Masquer toutes les slides
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Afficher la slide sélectionnée
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        currentSlide = index;
    }
    
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % totalSlides;
        showSlide(nextIndex);
    }
    
    // Changer de slide toutes les 5 secondes
    if (totalSlides > 0) {
        setInterval(nextSlide, 5000);
    }
    
    // Gestion des indicateurs de carrousel
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Validation du formulaire
    const form = document.getElementById('inscription-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Validation basique
            if (!name || !email || !password) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            if (password.length < 8) {
                alert('Le mot de passe doit contenir au moins 8 caractères.');
                return;
            }
            
            // Validation email universitaire
            if (!email.endsWith('.edu') && !email.includes('universite') && !email.includes('etudiant')) {
                if (!confirm("L'adresse email ne semble pas être une adresse universitaire. Souhaitez-vous continuer ?")) {
                    return;
                }
            }
            
            // Simuler l'envoi du formulaire
            const submitBtn = document.querySelector('.btn-primary[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Création du compte...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Compte créé avec succès! Bienvenue dans la communauté Concordia.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
            }, 1500);
        });
    }
    
    // Animation au chargement de la page
    const authSection = document.querySelector('.auth');
    const heroSection = document.querySelector('.hero');
    
    if (authSection && heroSection) {
        authSection.style.opacity = '0';
        heroSection.style.opacity = '0';
        
        setTimeout(() => {
            authSection.style.transition = 'opacity 0.8s ease';
            authSection.style.opacity = '1';
            
            heroSection.style.transition = 'opacity 0.8s ease 0.2s';
            heroSection.style.opacity = '1';
        }, 100);
    }
    
    // Lien vers Google
    const googleBtn = document.querySelector('.btn-social.google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            alert('Connexion avec Google - Cette fonctionnalité sera implémentée ultérieurement.');
        });
    }
});