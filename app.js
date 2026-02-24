// Variable globale pour mémoriser le lieu en cours de visite
let magasinEnCours = null;

// --- 1. INITIALISATION DE LA CARTE ---
const map = L.map('map').setView([47.2184, -1.5536], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '© OpenStreetMap'
}).addTo(map);

const starIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/118/118669.png',
  iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15]
});

// --- 2. BASE DE DONNÉES ---
const acteursReemploi = [
  {
    nom: "La Ressourcerie de l'Île",
    lat: 47.1996, lng: -1.5473,
    adresse: "90 Rue de la Basse Île, Rezé",
    horaires: "Mar-Sam: 10h-18h",
    concept: "Meubles, vaisselle, vêtements d'occasion.",
    funFact: "Acheter un meuble d'occasion ici permet d'économiser en moyenne 40kg de CO2 !",
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

// Affichage des marqueurs
acteursReemploi.forEach(lieu => {
  const lienItineraire = `https://www.google.com/maps/dir/?api=1&destination=${lieu.lat},${lieu.lng}`;
  const popupHTML = `
    <div class="popup-content">
        <h3>${lieu.nom}</h3>
        <p>📍 ${lieu.adresse}</p>
        <p>🕒 ${lieu.horaires}</p>
        <p>💡 ${lieu.concept}</p>
        <a href="${lienItineraire}" target="_blank" class="btn-itineraire">Y aller 🚶‍♂️</a>
        <button onclick="verifierPosition('${lieu.nom}')" class="btn-valider">Valider ma visite 📸</button>
    </div>
  `;
  L.marker([lieu.lat, lieu.lng], { icon: starIcon }).addTo(map).bindPopup(popupHTML);
});

// --- 3. NAVIGATION (ONGLETS) ---
function changerVue(idVueDemandee, elementBouton) {
    document.querySelectorAll('.vue').forEach(vue => vue.classList.remove('active'));
    document.getElementById(idVueDemandee).classList.add('active');

    if (elementBouton) {
        document.querySelectorAll('.barre-navigation button').forEach(btn => btn.classList.remove('actif'));
        elementBouton.classList.add('actif');
    }

    if (idVueDemandee === 'vue-map') {
        setTimeout(() => { map.invalidateSize(); }, 100);
    }
}

// --- 4. MODE DÉMO (MAGIC WIZARD) ---
function verifierPosition(nomMagasin) {
  magasinEnCours = acteursReemploi.find(lieu => lieu.nom === nomMagasin);
  alert(`📍 Mode Démo : Vérification GPS pour ${nomMagasin}...`);

  setTimeout(() => {
    alert(`✅ Position validée !\n\n📸 Simulation de la prise de photo...`);
    setTimeout(() => {
      alert("🎉 Photo validée ! Ouverture du booster...");
      
      // Remplir la carte
      document.getElementById('carte-nom').innerText = magasinEnCours.nom;
      document.getElementById('carte-concept').innerText = magasinEnCours.concept;
      document.getElementById('carte-funfact').innerText = magasinEnCours.funFact;
      document.getElementById('carte-image').src = magasinEnCours.image;

      // Afficher la modale
      document.getElementById('booster-modal').classList.remove('modal-cachee');
    }, 1200); 
  }, 1000); 
}

// --- 5. ANIMATION BOOSTER ---
function retournerCarte() {
  document.getElementById('ma-carte').classList.add('retournee');
}

function fermerBooster() {
  document.getElementById('booster-modal').classList.add('modal-cachee');
  document.getElementById('ma-carte').classList.remove('retournee');
  
  if (magasinEnCours) {
      sauvegarderCarte(magasinEnCours);
      afficherAlbum();
      alert("Carte rangée ! Va jeter un œil à l'onglet Album.");
  }
}

// --- 6. GESTION DE L'ALBUM (LOCALSTORAGE) ---
function sauvegarderCarte(magasin) {
    let album = JSON.parse(localStorage.getItem('derniereMainAlbum')) || [];
    const dejaPossedee = album.find(carte => carte.nom === magasin.nom);
    if (!dejaPossedee) {
        album.push(magasin);
        localStorage.setItem('derniereMainAlbum', JSON.stringify(album));
    }
}

function afficherAlbum() {
    const album = JSON.parse(localStorage.getItem('derniereMainAlbum')) || [];
    const conteneur = document.getElementById('grille-album');
    
    if (album.length === 0) {
        conteneur.innerHTML = "<p style='grid-column: span 2; color: #7f8c8d;'>Votre album est vide. Explorez la carte !</p>";
        return;
    }

    conteneur.innerHTML = ''; 
    album.forEach(carte => {
        conteneur.innerHTML += `
            <div class="carte-miniature">
                <img src="${carte.image}" alt="${carte.nom}">
                <h4>${carte.nom}</h4>
            </div>
        `;
    });
}

function viderAlbum() {
    if(confirm("Veux-tu vraiment réinitialiser l'album pour la démo ?")) {
        localStorage.removeItem('derniereMainAlbum');
        afficherAlbum();
        alert("Album vidé avec succès !");
    }
}

// --- 7. INITIALISATION ---
afficherAlbum(); // Charge l'album au démarrage

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker OK'))
      .catch(err => console.error('Erreur SW:', err));
  });
}