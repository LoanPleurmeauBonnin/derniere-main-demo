let magasinEnCours = null;

// ==========================================
// 1. INITIALISATION LEAFLET (Sans clé API !)
// ==========================================
// On désactive le zoomControl pour garder un look d'application native très propre
const map = L.map('map', { zoomControl: false }).setView([47.2184, -1.5536], 13);

// LE SECRET : Le fond de carte "Voyager" de CartoDB (très clair, coloré et moderne)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
    maxZoom: 19
}).addTo(map);

// ==========================================
// 2. DONNÉES ET MARQUEURS
// ==========================================
const acteursReemploi = [
  {
    nom: "La Ressourcerie de l'Île",
    lat: 47.1996, lng: -1.5473,
    adresse: "90 Rue de la Basse Île, Rezé",
    horaires: "Mar-Sam: 10h-18h",
    concept: "Meubles, vaisselle, vêtements d'occasion.",
    funFact: "Acheter un meuble d'occasion ici permet d'économiser 40kg de CO2 !",
    image: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=400"
  },
  {
    nom: "Boutique Solidaire",
    lat: 47.2152, lng: -1.5562,
    adresse: "Centre-ville, Nantes",
    horaires: "Lun-Sam: 9h-19h",
    concept: "Vêtements de seconde main au kilo.",
    funFact: "Acheter un vêtement d'occasion économise des milliers de litres d'eau !",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"
  }
];

// Création de l'icône personnalisée (qui utilise ton CSS .custom-marker)
const customIcon = L.divIcon({
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10] // Pour centrer le point exactement sur les coordonnées
});

acteursReemploi.forEach(lieu => {
    // ⚠️ Attention : Retour au format [Latitude, Longitude] avec Leaflet !
    const marker = L.marker([lieu.lat, lieu.lng], { icon: customIcon }).addTo(map);

    // Clic sur le marqueur = Ouverture du Bottom Sheet
    marker.on('click', () => {
        ouvrirSheetLieu(lieu);
    });
});

// Clic sur la carte vide = fermer le sheet
map.on('click', () => {
    document.getElementById('bottom-sheet').classList.add('cache');
});

// ==========================================
// 3. LOGIQUE DU BOTTOM SHEET (OVERLAY)
// ==========================================
function ouvrirSheetLieu(lieu) {
    magasinEnCours = lieu;
    
    // Remplissage des données
    document.getElementById('sheet-nom').innerText = lieu.nom;
    document.getElementById('sheet-adresse').innerHTML = `${lieu.adresse}<br>🕒 ${lieu.horaires}`;
    document.getElementById('sheet-concept').innerText = lieu.concept;
    document.getElementById('sheet-image').src = lieu.image;
    
    // Configurer le bouton Itinéraire
    const lienItineraire = `http://googleusercontent.com/maps.google.com/dir//${lieu.lat},${lieu.lng}`;
    document.getElementById('btn-y-aller').onclick = () => window.open(lienItineraire, '_blank');
    
    // Configurer le bouton de validation (Mode Démo)
    document.getElementById('btn-valider-visite').onclick = () => verifierPosition();

    // Afficher le sheet
    document.getElementById('bottom-sheet').classList.remove('cache');
}

// Clic sur la carte vide = fermer le sheet
map.on('click', () => {
    document.getElementById('bottom-sheet').classList.add('cache');
});

// ==========================================
// 4. CORRECTION NAVIGATION POUR LEAFLET
// ==========================================
// Dans ta fonction changerVue(), n'oublie pas de remettre invalidateSize() au lieu de resize()
function changerVue(idVueDemandee, elementBouton) {
    document.querySelectorAll('.vue').forEach(vue => vue.classList.remove('active'));
    document.getElementById(idVueDemandee).classList.add('active');

    if (elementBouton) {
        document.querySelectorAll('.barre-navigation button').forEach(btn => btn.classList.remove('actif'));
        elementBouton.classList.add('actif');
    }

    // Le retour de invalidateSize() pour Leaflet
    if (idVueDemandee === 'vue-map') {
        setTimeout(() => map.invalidateSize(), 100);
    }
    
    document.getElementById('bottom-sheet').classList.add('cache');
}

// ==========================================
// 5. LE MODE DÉMO (MAGIC WIZARD)
// ==========================================
function verifierPosition() {
    // On cache le sheet pour la propreté de la démo
    document.getElementById('bottom-sheet').classList.add('cache');
    
    alert(`📍 Vérification GPS pour ${magasinEnCours.nom}...`);

    setTimeout(() => {
        alert(`✅ Position validée !\n\n📸 Simulation prise de photo...`);
        setTimeout(() => {
            alert("🎉 Photo validée ! Ouverture du booster...");
            
            // Préparer le booster
            document.getElementById('carte-nom').innerText = magasinEnCours.nom;
            document.getElementById('carte-concept').innerText = magasinEnCours.concept;
            document.getElementById('carte-funfact').innerText = magasinEnCours.funFact;
            document.getElementById('carte-image').src = magasinEnCours.image;

            // Afficher la modale 3D
            document.getElementById('booster-modal').classList.remove('modal-cachee');
        }, 1200); 
    }, 1000); 
}

function retournerCarte() {
    document.getElementById('ma-carte').classList.add('retournee');
}

function fermerBooster() {
    document.getElementById('booster-modal').classList.add('modal-cachee');
    document.getElementById('ma-carte').classList.remove('retournee');
    
    if (magasinEnCours) {
        sauvegarderCarte(magasinEnCours);
        afficherAlbum();
        alert("Carte rangée ! Va jeter un œil à l'onglet Profil.");
    }
}

// ==========================================
// 6. GESTION DE L'ALBUM (LOCALSTORAGE)
// ==========================================
function sauvegarderCarte(magasin) {
    let album = JSON.parse(localStorage.getItem('derniereMainAlbum')) || [];
    if (!album.find(carte => carte.nom === magasin.nom)) {
        album.push(magasin);
        localStorage.setItem('derniereMainAlbum', JSON.stringify(album));
    }
}

function afficherAlbum() {
    const album = JSON.parse(localStorage.getItem('derniereMainAlbum')) || [];
    const conteneur = document.getElementById('grille-album');
    
    if (album.length === 0) {
        conteneur.innerHTML = "<p class='text-muted'>Votre album est vide.</p>";
        return;
    }

    conteneur.innerHTML = ''; 
    album.forEach(carte => {
        conteneur.innerHTML += `
            <div class="carte-miniature">
                <img src="${carte.image}" alt="${carte.nom}">
            </div>
        `;
    });
}

function viderAlbum() {
    if(confirm("Veux-tu réinitialiser l'album pour la démo ?")) {
        localStorage.removeItem('derniereMainAlbum');
        afficherAlbum();
    }
}

// Initialisation au lancement
afficherAlbum();

// Service Worker pour PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
  });
}