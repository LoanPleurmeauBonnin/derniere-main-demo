// Variable globale pour mémoriser le lieu en cours de visite
let magasinEnCours = null;

// --- 1. INITIALISATION DE LA CARTE MAPBOX ---
// ⚠️ INSÈRE TON TOKEN MAPBOX ICI :
mapboxgl.accessToken = 'pk.VOTRE_CLE_API_MAPBOX_ICI'; 

const map = new mapboxgl.Map({
    container: 'map', // L'ID de ta div HTML
    style: 'mapbox://styles/mapbox/streets-v12', // Le design de la carte
    center: [-1.5536, 47.2184], // ⚠️ ATTENTION : [Longitude, Latitude] pour Nantes
    zoom: 13
});

// Ajouter les contrôles de navigation (Zoom et rotation)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// --- 2. BASE DE DONNÉES ET MARQUEURS ---
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

acteursReemploi.forEach(lieu => {
    // 1. Créer le marqueur visuel
    const el = document.createElement('div');
    el.className = 'custom-marker'; // Tu peux remplacer ça par tes beaux points verts avec icône

    // 2. L'ajouter à la carte SANS Popup
    const marker = new mapboxgl.Marker(el)
        .setLngLat([lieu.lng, lieu.lat])
        .addTo(map);

    // 3. Ajouter l'événement de clic pour ouvrir le Bottom Sheet
    el.addEventListener('click', () => {
        ouvrirSheetLieu(lieu);
    });
});

// --- LOGIQUE DU BOTTOM SHEET ---
function ouvrirSheetLieu(lieu) {
    // Remplir les données
    document.getElementById('sheet-nom').innerText = lieu.nom;
    document.getElementById('sheet-adresse').innerHTML = `${lieu.adresse}<br>${lieu.horaires}`;
    document.getElementById('sheet-concept').innerText = lieu.concept;
    
    // Mettre à jour le bouton d'itinéraire
    const lienItineraire = `http://googleusercontent.com/maps.google.com/dir//${lieu.lat},${lieu.lng}`;
    const btnYAller = document.getElementById('btn-y-aller');
    btnYAller.onclick = () => window.open(lienItineraire, '_blank');

    // Mémoriser le magasin en cours si tu veux garder le système de "Booster" pour la démo
    magasinEnCours = lieu;

    // Afficher le panneau
    document.getElementById('bottom-sheet').classList.remove('cache');
}

function fermerSheet() {
    document.getElementById('bottom-sheet').classList.add('cache');
}

// Optionnel : fermer le sheet quand on clique sur la carte
map.on('click', () => {
    fermerSheet();
});

// --- 3. CORRECTION DE LA NAVIGATION POUR MAPBOX ---
// Modifie juste cette petite ligne dans ta fonction changerVue()
function changerVue(idVueDemandee, elementBouton) {
    // ... ton code actuel pour cacher/afficher ...
    
    if (idVueDemandee === 'vue-map') {
        setTimeout(() => { 
            map.resize(); // Mapbox utilise resize() au lieu de invalidateSize()
        }, 100);
    }
}

// ... LE RESTE DE TON CODE (MODE DÉMO, ALBUM, BOOSTER) RESTE EXACTEMENT LE MÊME ...

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