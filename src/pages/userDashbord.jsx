import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios'

// ================= DONNÉES STATIQUES HORS COMPOSANT (PURETÉ REACT) =================
const RANDOM_CLIENT_NAMES = ["Jean P.", "Sébastien T.", "Mireille N.", "Omar B."];

const SPONSOR_PACKS = [
  { id: 'bronze', name: 'Pack Bronze 🔴', duration: '3 jours', price: 10000, desc: 'Visibilité doublée dans les résultats de recherche.' },
  { id: 'silver', name: 'Pack Argent 🥈', duration: '7 jours', price: 20000, desc: 'Positionnement prioritaire + badge Premium sur l’image.' },
  { id: 'gold', name: 'Pack Or 🔥', duration: '15 jours', price: 35000, desc: 'Haut de page garanti + notifications push aux acheteurs ciblés.' }
];

// ================= SOUS-COMPOSANT DE GESTION DES PHOTOS (ANNONCES) =================
function ImageUploader({ images, setImages }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newUrls = Array.from(fileList).map(file => URL.createObjectURL(file));
    setImages([...images, ...newUrls]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mb-4">
      <label className="small text-muted fw-bold mb-2">📸 Galerie Photos du bien ou véhicule</label>
      
      <div 
        className={`border border-2 dashed rounded p-4 text-center position-relative ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle bg-light'}`}
        style={{ borderStyle: 'dashed', cursor: 'pointer', transition: 'all 0.2s ease' }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
          style={{ cursor: 'pointer' }}
          onChange={handleChange} 
        />
        <div className="py-2">
          <span className="fs-3">📥</span>
          <p className="mb-1 small fw-bold text-dark">Glissez-déposez vos images ici, ou cliquez pour parcourir</p>
          <p className="text-muted mutual-small mb-0" style={{ fontSize: '11px' }}>Formats acceptés : JPG, PNG, WEBP</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {images.map((url, index) => (
            <div key={index} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '80px' }}>
              <img src={url} alt={`Prévisualisation ${index}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
              <button 
                type="button" 
                className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: '20px', height: '20px', fontSize: '10px', marginTop: '2px', marginRight: '2px' }}
                onClick={() => removeImage(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= COMPOSANT PRINCIPAL =================
function UserDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // GESTION DU MODAL DE SPONSORISATION
  const [selectedSponsorItem, setSelectedSponsorItem] = useState(null); 
  const [chosenPackId, setChosenPackId] = useState('bronze');
  const [paymentMethod, setPaymentMethod] = useState('om');
  const [phoneNumber, setPhoneNumber] = useState('');

  // INFORMATIONS DU PROFIL MODIFIABLES
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [favoritesCount, setFavoritesCount] = useState(0)

  // NOTE: variables de chargement/erreur utilisées dans le rendu JSX

  // Formulaire temporaire pour les paramètres
  const [profileForm, setProfileForm] = useState({ 
    ...profile,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // STATE IMMOBILIER
  const [immoListings, setImmoListings] = useState([
    {
      id: "immo-65",
      title: "Chambre balcon Clermont-Ferrand",
      category: "chambre",
      ville: "Clermont-Ferrand",
      quartier: "Montferrand",
      goudron: "35 m",
      location: "Clermont-Ferrand",
      price: 350000,
      pricePeriod: "mois",
      forRent: true,
      forSale: false,
      furnished: true,
      bedrooms: 1,
      bathrooms: 1,
      description: "Chambre confortable avec balcon, proche des commerces et des transports.",
      images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80"],
      status: "disponible",
      views: 142,
      isSponsored: false,
      sponsorPack: null
    }
  ]);

  // STATE AUTOMOBILE
  const [autoListings, setAutoListings] = useState([
    {
      id: "15",
      brand: "Toyota",
      model: "Hilux",
      year: 2021,
      category: ["vente"],
      price: 18000000,
      priceLocation: null,
      mileage: 56000,
      type: "Pick-up",
      moteur: "Diesel",
      transmission: "Manuelle",
      withDriver: false,
      color: "Blanc Polaire",
      ville: "Lyon",
      description: "La référence absolue en termes de robustesse.",
      images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80"],
      status: "disponible",
      views: 310,
      isSponsored: false,
      sponsorPack: null
    }
  ]);

  // SYSTEME DE DISCUSSION (Fils de messages)
  const [threads, setThreads] = useState([
    { 
      id: "th-1", 
      sender: 'Marc K.', 
      targetItem: 'Toyota Hilux', 
      date: 'Aujourd\'hui 09h', 
      read: false,
      messages: [
        { id: "m1", type: "received", text: "Bonjour, le Pick-up Hilux est-il toujours disponible ?", time: "09:00" },
        { id: "m2", type: "received", text: "Est-il possible de passer le voir ce soir ?", time: "09:02" }
      ]
    },
    { 
      id: "th-2", 
      sender: 'Alice M.', 
      targetItem: 'Chambre balcon Clermont-Ferrand', 
      date: 'Hier 18h', 
      read: true,
      messages: [
        { id: "m3", type: "received", text: "Bonjour, la caution de 8 mois est-elle négociable ?", time: "Hier 18:00" },
        { id: "m4", type: "sent", text: "Bonjour Alice, nous pouvons discuter d'un étalement si votre dossier est solide.", time: "Hier 18:30" }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState("th-1");
  const [replyText, setReplyText] = useState("");

  // Charger le profil et les annonces depuis le backend si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    let isMounted = true
    const fetchProfile = async () => {
      setLoadingProfile(true)
      try {
        const res = await axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
        if (!isMounted) return
        if (res.data?.success) {
          const p = res.data.profile
          setProfile({ name: p.name || '', phone: p.phone || '', email: p.email || '', avatar: p.avatar || '' })

          // Séparer les annonces automobiles et immobilières
          const annonces = res.data.annonces || []
          const autos = annonces.filter(a => a.categorie === 'automobile')
          const immos = annonces.filter(a => a.categorie === 'immobilier')
          setAutoListings(autos)
          setImmoListings(immos)

          // Mettre à jour le compteur de favoris
          if (res.data.favoritesCount !== undefined) {
            setFavoritesCount(res.data.favoritesCount)
          }
        } else {
          setProfileError(res.data?.error || 'Impossible de récupérer le profil')
        }
      } catch (err) {
        console.error('Erreur fetch profile:', err)
        setProfileError('Erreur de connexion au serveur')
      } finally {
        if (isMounted) setLoadingProfile(false)
      }
    }

    fetchProfile()
    return () => { isMounted = false }
  }, [])

  // SECTION AVIS ET SUGGESTIONS
  const [reviews, setReviews] = useState([
    { id: 1, target: 'Plateforme Automobile', rating: 5, comment: 'Très simple d’ajouter son véhicule.', date: '01/06/2026' }
  ]);
  const [newReview, setNewReview] = useState({ target: '', rating: 5, comment: '' });
  const [suggestionText, setSuggestionText] = useState("");

  const [formType, setFormType] = useState('auto');

  const [autoForm, setAutoForm] = useState({
    brand: '', model: '', year: 2024, isForRent: false, price: '', priceLocation: '',
    mileage: '', type: 'Berline', moteur: 'Essence', transmission: 'Automatique',
    withDriver: false, color: '', ville: '', description: ''
  });

  const [immoForm, setImmoForm] = useState({
    title: '', category: 'appartement', ville: '', quartier: '', goudron: '',
    price: '', pricePeriod: 'mois', typeTransaction: 'location', furnished: true,
    bedrooms: 1, bathrooms: 1, description: '', numMois: ''
  });

  const [uploadedAutoImages, setUploadedAutoImages] = useState([]);
  const [uploadedImmoImages, setUploadedImmoImages] = useState([]);

  // MODAL DE DURÉE POUR STATUT OCCUPÉ/VENDU
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    itemId: null,
    itemType: null, // 'auto' ou 'immo'
    currentStatus: null,
    isForRent: null,
    duration: 1,
    durationType: 'jours' // 'jours' ou 'heures'
  });

  // ACTION DE SOUMISSION DE SPONSORISATION
  const handleApplySponsor = (e) => {
    e.preventDefault();
    const selectedPack = SPONSOR_PACKS.find(p => p.id === chosenPackId);
    const methodLabel = paymentMethod === 'om' ? 'Orange Money' : 'MTN Mobile Money';
    
    if (selectedSponsorItem.type === 'auto') {
      setAutoListings(prev => prev.map(item => item.id === selectedSponsorItem.id ? { ...item, isSponsored: true, sponsorPack: selectedPack.name } : item));
    } else {
      setImmoListings(prev => prev.map(item => item.id === selectedSponsorItem.id ? { ...item, isSponsored: true, sponsorPack: selectedPack.name } : item));
    }
    
    alert(`🎉 Félicitations ! Un SMS de validation de paiement a été envoyé sur votre numéro (${phoneNumber}) via ${methodLabel}.\nVotre annonce est maintenant sponsorisée avec le ${selectedPack.name} pour une durée de ${selectedPack.duration}.`);
    setSelectedSponsorItem(null);
    setPhoneNumber('');
  };

  // CHANGEMENT DE STATUT (VENDU / OCCUPÉ) AVEC MODAL DE DURÉE
  const toggleAutoStatus = (id, currentStatus, isForRent) => {
    if (currentStatus === "disponible" && isForRent) {
      // Ouvrir le modal pour sélectionner la durée de l'occupation
      setStatusModal({
        isOpen: true,
        itemId: id,
        itemType: 'auto',
        currentStatus: currentStatus,
        isForRent: isForRent,
        duration: 1,
        durationType: 'jours'
      });
    } else {
      // Passer directement à "vendu" ou revenir à "disponible"
      const nextStatus = currentStatus === "disponible" ? "vendu" : "disponible";
      setAutoListings(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    }
  };

  const toggleImmoStatus = (id, currentStatus, isForRent) => {
    if (currentStatus === "disponible" && isForRent) {
      // Ouvrir le modal pour sélectionner la durée de l'occupation
      setStatusModal({
        isOpen: true,
        itemId: id,
        itemType: 'immo',
        currentStatus: currentStatus,
        isForRent: isForRent,
        duration: 1,
        durationType: 'jours'
      });
    } else {
      // Passer directement à "vendu" ou revenir à "disponible"
      const nextStatus = currentStatus === "disponible" ? "vendu" : "disponible";
      setImmoListings(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    }
  };

  // APPLIQUER LE CHANGEMENT DE STATUT AVEC AUTO-REVERT
  const handleApplyStatusChange = () => {
    const { itemId, itemType, duration, durationType, isForRent } = statusModal;
    const nextStatus = isForRent ? "occupé" : "vendu";
    
    // Calculer le délai en millisecondes
    const delayMs = durationType === 'jours' ? duration * 24 * 60 * 60 * 1000 : duration * 60 * 60 * 1000;
    
    // Mettre à jour le statut immédiatement
    if (itemType === 'auto') {
      setAutoListings(prev => prev.map(item => item.id === itemId ? { ...item, status: nextStatus } : item));
    } else {
      setImmoListings(prev => prev.map(item => item.id === itemId ? { ...item, status: nextStatus } : item));
    }
    
    // Programmer le retour automatique à "disponible"
    // eslint-disable-next-line no-unused-vars
    const timer = setTimeout(() => {
      if (itemType === 'auto') {
        setAutoListings(prev => prev.map(item => item.id === itemId ? { ...item, status: "disponible" } : item));
      } else {
        setImmoListings(prev => prev.map(item => item.id === itemId ? { ...item, status: "disponible" } : item));
      }
      alert(`✅ L'annonce "${itemId}" est passée au statut "disponible" après ${duration} ${durationType}.`);
    }, delayMs);
    
    setStatusModal({ ...statusModal, isOpen: false });
  };

  // GESTION DU CHANGEMENT D'AVATAR
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setProfileForm({ ...profileForm, avatar: fileUrl });
    }
  };

  // MISE A JOUR DES INFOS UTILISATEUR
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        alert("⚠️ Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        return;
      }
      alert("🔒 Mot de passe mis à jour de manière sécurisée !");
    }

    setProfile({
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      avatar: profileForm.avatar
    });
    
    setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    alert("⚙️ Vos modifications ont été appliquées avec succès !");
    setActiveTab('dashboard');
  };

  // SUPPRESSION DU COMPTE
  const handleDeleteAccount = () => {
    const firstCheck = window.confirm("❗ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement votre compte ?");
    if (firstCheck) {
      const secondCheck = window.confirm("💥 Confirmation finale : Toutes vos annonces seront supprimées. Continuer ?");
      if (secondCheck) {
        alert("🗑️ Votre compte a été supprimé.");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      alert("🚪 Déconnexion réussie.");
    }
  };

  // CALCULS STATS (Valeurs fixées statiquement)
  const totalAutoViews = autoListings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalImmoViews = immoListings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalGlobalViews = totalAutoViews + totalImmoViews; 
  const totalAnnonces = immoListings.length + autoListings.length;
  const unreadCount = threads.filter(t => !t.read).length;

  const currentThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const uniqueMsgId = `sent-msg-${new Date().getTime()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          date: "À l'instant",
          messages: [
            ...t.messages,
            { id: uniqueMsgId, type: "sent", text: replyText, time: timestamp }
          ]
        };
      }
      return t;
    }));

    setReplyText("");
  }, [replyText, activeThreadId]);

  const selectThread = (id) => {
    setActiveThreadId(id);
    setThreads(prevThreads => prevThreads.map(t => t.id === id ? { ...t, read: true } : t));
  };

  const triggerSimulatedClientMessage = useCallback((itemTitle) => {
    const randomIndex = Math.floor(Math.random() * RANDOM_CLIENT_NAMES.length);
    const clientName = RANDOM_CLIENT_NAMES[randomIndex];
    const runtimeTimestamp = new Date().getTime();
    const threadId = `th-${runtimeTimestamp}`;

    const newThread = {
      id: threadId,
      sender: clientName,
      targetItem: itemTitle,
      date: "À l'instant",
      read: false,
      messages: [
        { 
          id: `sm-msg-${runtimeTimestamp}`, 
          type: "received", 
          text: `Bonjour ! Je suis vivement intéressé par votre annonce "${itemTitle}". Est-elle toujours disponible ?`, 
          time: "Maintenant" 
        }
      ]
    };

    setThreads(prevThreads => [newThread, ...prevThreads]);
    setActiveThreadId(threadId);
    alert(`📥 Nouveau message reçu de ${clientName} pour : ${itemTitle} !`);
  }, []);

  const handleAutoSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token')
    const payload = {
      categorie: 'automobile',
      title: `${autoForm.brand} ${autoForm.model}`,
      brand: autoForm.brand,
      model: autoForm.model,
      year: parseInt(autoForm.year),
      category: [autoForm.isForRent ? 'location' : 'vente'],
      price: autoForm.isForRent ? null : parseFloat(autoForm.price),
      priceLocation: autoForm.isForRent ? parseFloat(autoForm.priceLocation) : null,
      mileage: parseInt(autoForm.mileage) || 0,
      moteur: autoForm.moteur,
      transmission: autoForm.transmission,
      withDriver: autoForm.withDriver,
      color: autoForm.color,
      ville: autoForm.ville,
      description: autoForm.description,
      images: uploadedAutoImages
    }

    const doCreateAuto = async () => {
      try {
        const res = await axios.post('/api/annonces', payload, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data?.success) {
          const createdId = res.data.id
          const created = { id: createdId, brand: autoForm.brand, model: autoForm.model, year: autoForm.year, category: payload.category, price: payload.price, priceLocation: payload.priceLocation, mileage: payload.mileage, moteur: payload.moteur, transmission: payload.transmission, withDriver: payload.withDriver, color: payload.color, ville: payload.ville, description: payload.description, images: payload.images.length ? payload.images : [] , status: 'disponible', views: 0, isSponsored: false }
          setAutoListings([created, ...autoListings])
          setUploadedAutoImages([])
          setActiveTab('annonces')
          alert('Annonce automobile créée avec succès.')
        } else {
          alert('Erreur lors de la création de l\'annonce.')
        }
      } catch (err) {
        console.error('Erreur create auto:', err)
        alert('Erreur réseau lors de la création de l\'annonce.')
      }
    }
    doCreateAuto()
  };

  const handleImmoSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token')
    const isRent = immoForm.typeTransaction === 'location';
    const payload = {
      categorie: 'immobilier',
      title: immoForm.title,
      category_immo: immoForm.category,
      ville: immoForm.ville,
      quartier: immoForm.quartier,
      goudron_proximite: immoForm.goudron,
      price: parseFloat(immoForm.price),
      pricePeriod: immoForm.pricePeriod,
      typeTransaction: immoForm.typeTransaction,
      furnished: immoForm.furnished,
      bedrooms: parseInt(immoForm.bedrooms),
      bathrooms: parseInt(immoForm.bathrooms),
      description: immoForm.description,
      images: uploadedImmoImages,
      num_mois_minimum: immoForm.numMois
    }

    const doCreateImmo = async () => {
      try {
        const res = await axios.post('/api/annonces', payload, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data?.success) {
          const createdId = res.data.id
          const created = { id: createdId, title: immoForm.title, ville: immoForm.ville, forRent: isRent, price: payload.price, pricePeriod: payload.pricePeriod, bedrooms: payload.bedrooms, bathrooms: payload.bathrooms, images: payload.images, status: 'disponible', views: 0, isSponsored: false }
          setImmoListings([created, ...immoListings])
          setUploadedImmoImages([])
          setActiveTab('annonces')
          alert('Annonce immobilière créée avec succès.')
        } else {
          alert('Erreur lors de la création de l\'annonce immobilière.')
        }
      } catch (err) {
        console.error('Erreur create immo:', err)
        alert('Erreur réseau lors de la création de l\'annonce immobilière.')
      }
    }
    doCreateImmo()
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviews([{ id: Date.now(), target: newReview.target, rating: parseInt(newReview.rating), comment: newReview.comment, date: 'Aujourd\'hui' }, ...reviews]);
    setNewReview({ target: '', rating: 5, comment: '' });
  };

  const handleDeleteReview = (idToRemove) => {
    setReviews(reviews.filter(review => review.id !== idToRemove));
  };

  const handleSuggestionSubmit = (e) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    alert(`📨 Votre suggestion a été envoyée avec succès à l'administration.`);
    setSuggestionText("");
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ================= MODAL DE DURÉE STATUT ================= */}
      {statusModal.isOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning bg-opacity-10 border-warning">
                <h5 className="modal-title fw-bold">⏱️ Définir la durée d'occupation</h5>
                <button type="button" className="btn-close" onClick={() => setStatusModal({ ...statusModal, isOpen: false })}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  L'annonce passera au statut <strong>"{statusModal.isForRent ? 'occupé' : 'vendu'}"</strong> et reviendra à <strong>"disponible"</strong> après l'intervalle spécifié.
                </p>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Nombre :</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={statusModal.duration}
                    onChange={(e) => setStatusModal({ ...statusModal, duration: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Unité :</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="durationType"
                      id="durationTypeDays"
                      value="jours"
                      checked={statusModal.durationType === 'jours'}
                      onChange={(e) => setStatusModal({ ...statusModal, durationType: e.target.value })}
                    />
                    <label className="btn btn-outline-primary" htmlFor="durationTypeDays">📅 Jours</label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="durationType"
                      id="durationTypeHours"
                      value="heures"
                      checked={statusModal.durationType === 'heures'}
                      onChange={(e) => setStatusModal({ ...statusModal, durationType: e.target.value })}
                    />
                    <label className="btn btn-outline-primary" htmlFor="durationTypeHours">⏰ Heures</label>
                  </div>
                </div>

                <div className="alert alert-info alert-sm mb-0">
                  <small>
                    ✅ Statut changé en <strong>"{statusModal.isForRent ? 'occupé' : 'vendu'}"</strong> pour <strong>{statusModal.duration} {statusModal.durationType}</strong>, puis repassera à <strong>"disponible"</strong> automatiquement.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStatusModal({ ...statusModal, isOpen: false })}>Annuler</button>
                <button type="button" className="btn btn-warning fw-bold" onClick={handleApplyStatusChange}>✅ Appliquer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        
        {/* ================= SIDEBAR ================= */}
        <nav className={`col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between ${isSidebarOpen ? 'd-block' : 'd-none d-md-flex'}`} style={{ minHeight: '100vh', position: isSidebarOpen ? 'fixed' : 'relative', zIndex: 1050, width: isSidebarOpen ? '280px' : '' }}>
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
              <span className="fs-4 fw-bold text-white">✨ Immo 2.0 Pro</span>
              {isSidebarOpen && <button className="btn btn-sm btn-outline-light d-md-none" onClick={() => setIsSidebarOpen(false)}>✕</button>}
            </div>
            
            <div className="bg-secondary bg-opacity-25 p-3 rounded mb-3 text-center border border-secondary border-opacity-50">
              <div className="mb-2 position-relative d-inline-block">
                <img 
                  src={profile.avatar} 
                  alt="Profil" 
                  className="rounded-circle border border-2 border-info shadow-sm"
                  style={{ width: '65px', height: '65px', objectFit: 'cover' }}
                />
              </div>
              <div className="fw-bold text-info text-truncate">{profile.name || 'Profil'}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>{profile.email || ''}</div>
              <div className="small text-white-50 mt-1">💖 Favoris : {favoritesCount}</div>
              {loadingProfile && <div className="small text-warning mt-2">Chargement du profil...</div>}
              {profileError && <div className="small text-danger mt-2">{profileError}</div>}
            </div>
            <hr className="text-secondary mt-0" />
            
            <ul className="nav flex-column gap-2">
              <button className={`nav-link w-100 text-start border-0 p-2 rounded d-flex align-items-center gap-2 ${activeTab === 'dashboard' ? 'bg-secondary text-white' : 'text-light bg-transparent'}`} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>📊 Vue d'ensemble</button>
              <button className={`nav-link w-100 text-start border-0 p-2 rounded d-flex align-items-center gap-2 ${activeTab === 'annonces' ? 'bg-secondary text-white' : 'text-light bg-transparent'}`} onClick={() => { setActiveTab('annonces'); setIsSidebarOpen(false); }}>📣 Mes Annonces ({totalAnnonces})</button>
              <button className={`nav-link w-100 text-start border-0 p-2 rounded d-flex align-items-center justify-content-between ${activeTab === 'messages' ? 'bg-secondary text-white' : 'text-light bg-transparent'}`} onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }}>
                <span>💬 Messagerie Live</span> {unreadCount > 0 && <span className="badge bg-danger">{unreadCount}</span>}
              </button>
              <button className={`nav-link w-100 text-start border-0 p-2 rounded d-flex align-items-center gap-2 ${activeTab === 'avis' ? 'bg-secondary text-white' : 'text-light bg-transparent'}`} onClick={() => { setActiveTab('avis'); setIsSidebarOpen(false); }}>⭐ Avis & Suggestions</button>
              <button className={`nav-link w-100 text-start border-0 p-2 rounded d-flex align-items-center gap-2 ${activeTab === 'parametres' ? 'bg-secondary text-white' : 'text-light bg-transparent'}`} onClick={() => { setProfileForm({...profile, currentPassword: '', newPassword: '', confirmPassword: ''}); setActiveTab('parametres'); setIsSidebarOpen(false); }}>⚙️ Paramètres</button>
            </ul>
          </div>

          <div className="pt-3 border-top border-secondary border-opacity-20 mt-4">
            <button className="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              🚪 Déconnexion
            </button>
          </div>
        </nav>

        {isSidebarOpen && <div className="d-md-none" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }} onClick={() => setIsSidebarOpen(false)} />}

        {/* ================= CONTENU GENERAL ================= */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom gap-3">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-outline-dark d-md-none" onClick={() => setIsSidebarOpen(true)}>☰</button>
              <h1 className="h2 fw-bold text-dark mb-0">Business Dashboard</h1>
            </div>
            <button className="btn btn-dark btn-sm fw-bold" onClick={() => setActiveTab('publier')}>+ Nouveau Produit</button>
          </div>

          {/* TAB 1 : VUE D'ENSEMBLE (CONTIENT DÉSORMAIS UNIQUEMENT LES BLOCS DE STATS) */}
          {activeTab === 'dashboard' && (
            <>
              {/* LES COMPTEURS SONT PLACÉS ICI ET SERONT CACHÉS PARTOUT AILLEURS */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3"><div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}><h6 className="text-muted small mb-1">👀 Total Vues Générales</h6><h3 className="fw-bold mb-0 text-primary">{totalGlobalViews}</h3></div></div>
                <div className="col-12 col-sm-6 col-lg-3"><div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}><h6 className="text-muted small mb-1">🚗 Vues Automobiles</h6><h3 className="fw-bold mb-0 text-info">{totalAutoViews}</h3></div></div>
                <div className="col-12 col-sm-6 col-lg-3"><div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}><h6 className="text-muted small mb-1">🏠 Vues Immobilier</h6><h3 className="fw-bold mb-0 text-success">{totalImmoViews}</h3></div></div>
                <div className="col-12 col-sm-6 col-lg-3"><div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}><h6 className="text-muted small mb-1">📩 Fils non lus</h6><h3 className="fw-bold mb-0 text-danger">{unreadCount}</h3></div></div>
              </div>

              <div className="card border-0 shadow-sm p-3 p-md-4 bg-white" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-3">📈 Audimétrie des Annonces</h5>
                
                <h6 className="fw-bold text-info">Secteur Automobile</h6>
                <div className="table-responsive d-none d-md-block mb-4">
                  <table className="table table-hover align-middle">
                    <thead className="table-light"><tr><th>Modèle</th><th>Ville</th><th>Prix</th><th>État</th><th className="text-end">Performance</th></tr></thead>
                    <tbody>
                      {autoListings.map(a => (
                        <tr key={a.id} style={{ borderLeft: a.isSponsored ? '4px solid #ffc107' : 'none' }}>
                          <td>
                            <strong>{a.brand} {a.model}</strong>
                            {a.isSponsored && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '10px' }}>SPONSORISÉ</span>}
                          </td>
                          <td>📍 {a.ville}</td>
                          <td className="fw-bold">{a.price ? `${a.price.toLocaleString()} FCFA` : `${a.priceLocation.toLocaleString()} FCFA/j`}</td>
                          <td>
                            <span className={`badge ${a.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{a.status.toUpperCase()}</span>
                          </td>
                          <td className="text-end"><span className="badge bg-info">{a.views} vues</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* RESPONSIVE AUTO CARDS FOR MOBILE */}
                <div className="d-block d-md-none mb-4">
                  {autoListings.map(a => (
                    <div key={a.id} className="card p-3 mb-2 border" style={{ borderRadius: '8px', borderLeft: a.isSponsored ? '4px solid #ffc107' : '1px solid #dee2e6' }}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark">{a.brand} {a.model}</span>
                        <span className="badge bg-info">{a.views} vues</span>
                      </div>
                      <div className="small text-muted mb-2">📍 {a.ville} • <span className="fw-bold text-dark">{a.price ? `${a.price.toLocaleString()} FCFA` : `${a.priceLocation.toLocaleString()} FCFA/j`}</span></div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${a.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{a.status}</span>
                        {a.isSponsored && <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>SPONSORISÉ</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold text-success">Secteur Immobilier</h6>
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-hover align-middle">
                    <thead className="table-light"><tr><th>Titre du bien</th><th>Localisation</th><th>Régime</th><th>État</th><th className="text-end">Performance</th></tr></thead>
                    <tbody>
                      {immoListings.map(i => (
                        <tr key={i.id} style={{ borderLeft: i.isSponsored ? '4px solid #ffc107' : 'none' }}>
                          <td>
                            <strong>{i.title}</strong>
                            {i.isSponsored && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '10px' }}>SPONSORISÉ</span>}
                          </td>
                          <td>📍 {i.ville}</td>
                          <td><span className="badge bg-light text-dark">{i.forRent ? 'Location' : 'Vente'}</span></td>
                          <td>
                            <span className={`badge ${i.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{i.status.toUpperCase()}</span>
                          </td>
                          <td className="text-end"><span className="badge bg-success">{i.views} vues</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RESPONSIVE IMMO CARDS FOR MOBILE */}
                <div className="d-block d-md-none">
                  {immoListings.map(i => (
                    <div key={i.id} className="card p-3 mb-2 border" style={{ borderRadius: '8px', borderLeft: i.isSponsored ? '4px solid #ffc107' : '1px solid #dee2e6' }}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '75%' }}>{i.title}</span>
                        <span className="badge bg-success">{i.views} vues</span>
                      </div>
                      <div className="small text-muted mb-2">📍 {i.ville} • <span className="badge bg-light text-dark">{i.forRent ? 'Location' : 'Vente'}</span></div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${i.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{i.status}</span>
                        {i.isSponsored && <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>SPONSORISÉ</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2 : ANNONCES */}
          {activeTab === 'annonces' && (
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold mb-3">📋 Vos catalogues d'éléments actifs</h5>
              
              <h6 className="fw-bold text-dark mb-2">Automobiles ({autoListings.length})</h6>
              
              <div className="table-responsive d-none d-md-block mb-4">
                <table className="table align-middle">
                  <thead className="table-light"><tr><th>Images</th><th>Véhicule</th><th>Mode</th><th>Moteur</th><th>Statut</th><th>Actions commerciales</th></tr></thead>
                  <tbody>
                    {autoListings.map(a => {
                      const isRent = a.category[0] === "location";
                      return (
                        <tr key={a.id} className={a.status !== 'disponible' ? 'opacity-75 bg-light' : ''} style={{ borderLeft: a.isSponsored ? '4px solid #ffc107' : 'none' }}>
                          <td><img src={a.images[0]} alt="thumb" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                          <td>
                            <strong>{a.brand} {a.model}</strong>
                            {a.isSponsored && <div className="text-warning small fw-bold" style={{ fontSize: '10px' }}>⚡ {a.sponsorPack}</div>}
                          </td>
                          <td><span className="badge bg-dark">{a.category[0]}</span></td>
                          <td>{a.moteur}</td>
                          <td><span className={`badge ${a.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{a.status}</span></td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              <button type="button" className={`btn btn-xs py-1 px-2 small fw-bold ${a.status === 'disponible' ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ fontSize: '12px' }} onClick={() => toggleAutoStatus(a.id, a.status, isRent)}>
                                {a.status === 'disponible' ? `Marquer comme ${isRent ? 'occupé' : 'vendu'}` : 'Remettre disponible'}
                              </button>
                              {a.status === 'disponible' && (
                                <>
                                  <button type="button" className="btn btn-xs btn-outline-primary py-1 px-2 small" style={{ fontSize: '12px' }} onClick={() => triggerSimulatedClientMessage(`${a.brand} ${a.model}`)}>📥 Test</button>
                                  {!a.isSponsored && <button type="button" className="btn btn-xs btn-warning py-1 px-2 small fw-bold" style={{ fontSize: '12px' }} onClick={() => setSelectedSponsorItem({ id: a.id, title: `${a.brand} ${a.model}`, type: 'auto' })}>🚀 Sponsoriser</button>}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE AUTO CARDS */}
              <div className="d-block d-md-none mb-4">
                {autoListings.map(a => {
                  const isRent = a.category[0] === "location";
                  return (
                    <div key={a.id} className="card p-3 mb-3 border bg-white" style={{ borderRadius: '8px', borderLeft: a.isSponsored ? '4px solid #ffc107' : '1px solid #dee2e6' }}>
                      <div className="d-flex gap-3 align-items-center mb-2">
                        <img src={a.images[0]} alt="thumb" style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div className="fw-bold text-dark">{a.brand} {a.model}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{a.moteur} • <span className="badge bg-dark">{a.category[0]}</span></div>
                          {a.isSponsored && <div className="text-warning fw-bold" style={{ fontSize: '11px' }}>⚡ {a.sponsorPack}</div>}
                        </div>
                      </div>
                      <div className="mb-2"><span className={`badge ${a.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{a.status}</span></div>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        <button type="button" className={`btn btn-sm flex-grow-1 py-1 ${a.status === 'disponible' ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ fontSize: '12px' }} onClick={() => toggleAutoStatus(a.id, a.status, isRent)}>
                          {a.status === 'disponible' ? (isRent ? 'Occupé' : 'Vendu') : 'Libérer'}
                        </button>
                        {a.status === 'disponible' && (
                          <>
                            <button type="button" className="btn btn-sm btn-outline-primary py-1" style={{ fontSize: '12px' }} onClick={() => triggerSimulatedClientMessage(`${a.brand} ${a.model}`)}>📥 Test</button>
                            {!a.isSponsored && <button type="button" className="btn btn-sm btn-warning py-1 fw-bold" style={{ fontSize: '12px' }} onClick={() => setSelectedSponsorItem({ id: a.id, title: `${a.brand} ${a.model}`, type: 'auto' })}>🚀 Boost</button>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h6 className="fw-bold text-dark mb-2">Biens Immobiliers ({immoListings.length})</h6>
              
              <div className="table-responsive d-none d-md-block">
                <table className="table align-middle">
                  <thead className="table-light"><tr><th>Images</th><th>Bien</th><th>Caractéristiques</th><th>Loyer / Prix</th><th>Statut</th><th>Actions commerciales</th></tr></thead>
                  <tbody>
                    {immoListings.map(i => (
                      <tr key={i.id} className={i.status !== 'disponible' ? 'opacity-75 bg-light' : ''} style={{ borderLeft: i.isSponsored ? '4px solid #ffc107' : 'none' }}>
                        <td><img src={i.images[0]} alt="thumb" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                        <td>
                          <strong>{i.title}</strong>
                          {i.isSponsored && <div className="text-warning small fw-bold" style={{ fontSize: '10px' }}>⚡ {i.sponsorPack}</div>}
                        </td>
                        <td>🛏️ {i.bedrooms} | 🛁 {i.bathrooms}</td>
                        <td className="text-success fw-bold">{i.price.toLocaleString()} FCFA</td>
                        <td><span className={`badge ${i.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{i.status}</span></td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <button type="button" className={`btn btn-xs py-1 px-2 small fw-bold ${i.status === 'disponible' ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ fontSize: '12px' }} onClick={() => toggleImmoStatus(i.id, i.status, i.forRent)}>
                              {i.status === 'disponible' ? `Marquer comme ${i.forRent ? 'occupé' : 'vendu'}` : 'Remettre disponible'}
                            </button>
                            {i.status === 'disponible' && (
                              <>
                                <button type="button" className="btn btn-xs btn-outline-success py-1 px-2 small" style={{ fontSize: '12px' }} onClick={() => triggerSimulatedClientMessage(i.title)}>📥 Test</button>
                                {!i.isSponsored && <button type="button" className="btn btn-xs btn-warning py-1 px-2 small fw-bold" style={{ fontSize: '12px' }} onClick={() => setSelectedSponsorItem({ id: i.id, title: i.title, type: 'immo' })}>🚀 Sponsoriser</button>}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE IMMO CARDS */}
              <div className="d-block d-md-none">
                {immoListings.map(i => (
                  <div key={i.id} className="card p-3 mb-3 border bg-white" style={{ borderRadius: '8px', borderLeft: i.isSponsored ? '4px solid #ffc107' : '1px solid #dee2e6' }}>
                    <div className="d-flex gap-3 align-items-center mb-2">
                      <img src={i.images[0]} alt="thumb" style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div className="overflow-hidden">
                        <div className="fw-bold text-dark text-truncate">{i.title}</div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>🛏️ {i.bedrooms} p. • <span className="text-success fw-bold">{i.price.toLocaleString()} FCFA</span></div>
                        {i.isSponsored && <div className="text-warning fw-bold" style={{ fontSize: '11px' }}>⚡ {i.sponsorPack}</div>}
                      </div>
                    </div>
                    <div className="mb-2"><span className={`badge ${i.status === 'disponible' ? 'bg-success' : 'bg-danger'}`}>{i.status}</span></div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      <button type="button" className={`btn btn-sm flex-grow-1 py-1 ${i.status === 'disponible' ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ fontSize: '12px' }} onClick={() => toggleImmoStatus(i.id, i.status, i.forRent)}>
                        {i.status === 'disponible' ? (i.forRent ? 'Occupé' : 'Vendu') : 'Libérer'}
                      </button>
                      {i.status === 'disponible' && (
                        <>
                          <button type="button" className="btn btn-sm btn-outline-success py-1" style={{ fontSize: '12px' }} onClick={() => triggerSimulatedClientMessage(i.title)}>📥 Test</button>
                          {!i.isSponsored && <button type="button" className="btn btn-sm btn-warning py-1 fw-bold" style={{ fontSize: '12px' }} onClick={() => setSelectedSponsorItem({ id: i.id, title: i.title, type: 'immo' })}>🚀 Boost</button>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 : SYSTEME DE MESSAGERIE LIVE */}
          {activeTab === 'messages' && (
            <div className="card border-0 shadow-sm p-0 bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
              <div className="row g-0" style={{ height: '550px' }}>
                <div className={`col-12 col-md-4 border-end bg-light overflow-y-auto h-100 ${activeThreadId ? 'd-none d-md-block' : 'd-block'}`}>
                  <div className="p-3 bg-white border-bottom fw-bold text-secondary">💬 Conversations privées</div>
                  <div className="list-group list-group-flush">
                    {threads.map(t => (
                      <button key={t.id} type="button" onClick={() => selectThread(t.id)} className={`list-group-item list-group-item-action p-3 text-start border-bottom position-relative ${t.id === activeThreadId ? 'bg-secondary bg-opacity-10' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark small">{t.sender}</strong>
                          <small className="text-muted" style={{ fontSize: '10px' }}>{t.date}</small>
                        </div>
                        <div className="text-truncate text-muted small" style={{ maxWidth: '200px' }}>{t.messages[t.messages.length - 1]?.text}</div>
                        <span className="badge bg-secondary-subtle text-dark mt-1 d-inline-block text-truncate" style={{ fontSize: '10px', maxWidth: '100%' }}>📦 {t.targetItem}</span>
                        {!t.read && <span className="position-absolute top-50 end-0 translate-middle-y me-3 badge rounded-circle bg-danger p-1" style={{ width: '8px', height: '8px' }}></span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`col-12 col-md-8 d-flex flex-column h-100 ${!activeThreadId ? 'd-none d-md-flex' : 'd-flex'}`} style={{ backgroundColor: '#fff' }}>
                  {currentThread ? (
                    <>
                      <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <button type="button" className="btn btn-sm btn-outline-secondary d-md-none py-0 px-2 fs-5" onClick={() => setActiveThreadId(null)}>←</button>
                          <div>
                            <h6 className="fw-bold mb-0">{currentThread.sender}</h6>
                            <small className="text-muted">Sujet : <strong className="text-truncate d-inline-block align-bottom" style={{ maxWidth: '160px' }}>{currentThread.targetItem}</strong></small>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow-1 p-3 overflow-y-auto bg-light bg-opacity-25" style={{ height: 'calc(100% - 130px)' }}>
                        <div className="d-flex flex-column gap-2">
                          {currentThread.messages.map(m => (
                            <div key={m.id} className={`d-flex flex-column ${m.type === 'sent' ? 'align-items-end' : 'align-items-start'}`}>
                              <div className={`p-2.5 rounded shadow-sm small ${m.type === 'sent' ? 'bg-dark text-white rounded-bottom-start' : 'bg-white text-dark rounded-bottom-end border'}`} style={{ maxWidth: '85%', borderRadius: '12px' }}>{m.text}</div>
                              <small className="text-muted px-1 mt-0.5" style={{ fontSize: '9px' }}>{m.time}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 border-top bg-white">
                        <form onSubmit={handleSendMessage} className="d-flex gap-2">
                          <input type="text" className="form-control form-control-sm" placeholder={`Répondre à ${currentThread.sender}...`} value={replyText} onChange={e => setReplyText(e.target.value)} required />
                          <button type="submit" className="btn btn-dark btn-sm px-3 fw-bold">Envoyer</button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="m-auto text-center text-muted p-3">
                      <h5>Aucun fil sélectionné</h5>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 : AVIS & SUGGESTIONS */}
          {activeTab === 'avis' && (
            <div className="row g-4">
              <div className="col-12 col-md-5 d-flex flex-column gap-4">
                <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                  <h5 className="fw-bold mb-3">⭐ Laisser un Avis</h5>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3"><label className="small text-muted mb-1">Cible</label><input type="text" className="form-control" value={newReview.target} onChange={e => setNewReview({...newReview, target: e.target.value})} placeholder="Ex: Service Livraison" required /></div>
                    <div className="mb-3">
                      <label className="small text-muted mb-1">Note</label>
                      <select className="form-select" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: e.target.value})}>
                        <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5)</option>
                      </select>
                    </div>
                    <div className="mb-3"><label className="small text-muted mb-1">Commentaire</label><textarea className="form-control" rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} required></textarea></div>
                    <button type="submit" className="btn btn-dark btn-sm w-100">Soumettre l'avis</button>
                  </form>
                </div>

                <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px', borderLeft: '4px solid #0dcaf0' }}>
                  <h5 className="fw-bold mb-1">💡 Boîte à suggestions</h5>
                  <p className="text-muted small mb-3">Envoyez vos remarques ou idées d'amélioration directement à l'administration.</p>
                  <form onSubmit={handleSuggestionSubmit}>
                    <div className="mb-3">
                      <textarea 
                        className="form-control small" 
                        rows="4" 
                        placeholder="Écrivez votre message à l'administration ici..." 
                        value={suggestionText}
                        onChange={e => setSuggestionText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-info text-white btn-sm fw-bold w-100">Envoyer la suggestion</button>
                  </form>
                </div>
              </div>

              <div className="col-12 col-md-7">
                <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                  <h5 className="fw-bold mb-3">Historique de vos avis</h5>
                  {reviews.length === 0 ? (
                    <p className="text-muted small">Aucun avis enregistré.</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} className="p-3 border rounded mb-2 bg-light bg-opacity-50 position-relative d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex gap-2 align-items-center mb-1">
                            <strong className="text-dark">{r.target}</strong>
                            <span style={{ fontSize: '13px' }}>{'⭐'.repeat(r.rating)}</span>
                          </div>
                          <p className="small text-muted mb-0">"{r.comment}"</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-link p-0 text-danger text-decoration-none small" 
                          style={{ fontSize: '12px' }}
                          onClick={() => handleDeleteReview(r.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5 : PUBLIER */}
          {activeTab === 'publier' && (
            <div className="card border-0 shadow-sm p-3 p-md-4 bg-white mx-auto" style={{ borderRadius: '12px', maxWidth: '800px' }}>
              <h5 className="fw-bold mb-3">🚀 Déposer une annonce certifiée</h5>
              
              <div className="d-flex gap-2 mb-4 border-bottom pb-3">
                <button type="button" className={`btn btn-sm ${formType === 'auto' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFormType('auto')}>🚗 Saisir une Automobile</button>
                <button type="button" className={`btn btn-sm ${formType === 'immo' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFormType('immo')}>🏠 Saisir un bien Immobilier</button>
              </div>

              {formType === 'auto' && (
                <form onSubmit={handleAutoSubmit}>
                  <ImageUploader images={uploadedAutoImages} setImages={setUploadedAutoImages} />
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Marque</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Toyota" value={autoForm.brand} onChange={e => setAutoForm({...autoForm, brand: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Modèle</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Hilux" value={autoForm.model} onChange={e => setAutoForm({...autoForm, model: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Année</label>
                      <input type="number" className="form-control form-control-sm" value={autoForm.year} onChange={e => setAutoForm({...autoForm, year: e.target.value})} required />
                    </div>
                  </div>

                  <div className="mb-3 p-2.5 rounded bg-light border">
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" id="switchRentAuto" checked={autoForm.isForRent} onChange={e => setAutoForm({...autoForm, isForRent: e.target.checked})} />
                      <label className="form-check-label small fw-bold text-dark" htmlFor="switchRentAuto">Proposer ce véhicule à la location (tarif journalier)</label>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    {!autoForm.isForRent ? (
                      <div className="col-md-6">
                        <label className="small text-muted mb-1 fw-bold text-primary">Prix de vente global (FCFA)</label>
                        <input type="number" className="form-control form-control-sm border-primary" placeholder="Ex: 15000000" value={autoForm.price || ''} onChange={e => setAutoForm({...autoForm, price: e.target.value, priceLocation: ''})} required />
                      </div>
                    ) : (
                      <div className="col-md-6">
                        <label className="small text-muted mb-1 fw-bold text-warning">Tarif Location (FCFA / jour)</label>
                        <input type="number" className="form-control form-control-sm border-warning" placeholder="Ex: 50000" value={autoForm.priceLocation || ''} onChange={e => setAutoForm({...autoForm, priceLocation: e.target.value, price: ''})} required />
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Kilométrage (km)</label>
                      <input type="number" className="form-control form-control-sm" placeholder="Ex: 45000" value={autoForm.mileage} onChange={e => setAutoForm({...autoForm, mileage: e.target.value})} required />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Silhouette</label>
                      <select className="form-select form-select-sm" value={autoForm.type} onChange={e => setAutoForm({...autoForm, type: e.target.value})}>
                        <option value="Berline">Berline</option><option value="SUV">SUV</option><option value="Pick-up">Pick-up</option><option value="Utilitaire">Utilitaire</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Moteur</label>
                      <select className="form-select form-select-sm" value={autoForm.moteur} onChange={e => setAutoForm({...autoForm, moteur: e.target.value})}>
                        <option value="Essence">Essence</option><option value="Diesel">Diesel</option><option value="Hybride">Hybride</option><option value="Électrique">Électrique</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Transmission</label>
                      <select className="form-select form-select-sm" value={autoForm.transmission} onChange={e => setAutoForm({...autoForm, transmission: e.target.value})}>
                        <option value="Automatique">Automatique</option><option value="Manuelle">Manuelle</option>
                      </select>
                    </div>
                  </div>

                  {autoForm.isForRent && (
                    <div className="mb-3 p-2 bg-light rounded border border-warning-subtle">
                      <div className="form-check form-check-inline mb-0">
                        <input className="form-check-input" type="checkbox" id="driverCheck" checked={autoForm.withDriver} onChange={e => setAutoForm({...autoForm, withDriver: e.target.checked})} />
                        <label className="form-check-label small" htmlFor="driverCheck">Mise à disposition d'un chauffeur professionnel inclu</label>
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Couleur Extérieure</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Noir Métallisé" value={autoForm.color} onChange={e => setAutoForm({...autoForm, color: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Ville de disponibilité</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Douala" value={autoForm.ville} onChange={e => setAutoForm({...autoForm, ville: e.target.value})} required />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="small text-muted mb-1">Description et détails techniques</label>
                    <textarea className="form-control form-control-sm" rows="3" placeholder="Options, état général, révision..." value={autoForm.description} onChange={e => setAutoForm({...autoForm, description: e.target.value})} required></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark btn-sm w-100 fw-bold">🚀 Mettre en ligne le véhicule</button>
                </form>
              )}

              {formType === 'immo' && (
                <form onSubmit={handleImmoSubmit}>
                  <ImageUploader images={uploadedImmoImages} setImages={setUploadedImmoImages} />
                  
                  <div className="mb-3">
                    <label className="small text-muted mb-1">Intitulé commercial de l'annonce</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Ex: Bel appartement T3 lumineux avec terrasse" value={immoForm.title} onChange={e => setImmoForm({...immoForm, title: e.target.value})} required />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Typologie</label>
                      <select className="form-select form-select-sm" value={immoForm.category} onChange={e => setImmoForm({...immoForm, category: e.target.value})}>
                        <option value="appartement">Appartement</option><option value="maison">Maison</option><option value="studio">Studio</option><option value="chambre">Chambre</option><option value="terrain">Terrain</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Régime contractuel</label>
                      <select className="form-select form-select-sm fw-bold" value={immoForm.typeTransaction} onChange={e => setImmoForm({...immoForm, typeTransaction: e.target.value})}>
                        <option value="location" className="text-warning">Location standard</option>
                        <option value="vente" className="text-primary">Vente immobilière brute</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Ville</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Douala" value={immoForm.ville} onChange={e => setImmoForm({...immoForm, ville: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Quartier exact</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Bonapriso" value={immoForm.quartier} onChange={e => setImmoForm({...immoForm, quartier: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted mb-1">Accès route / Bitume</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Ex: Au bord du goudron" value={immoForm.goudron} onChange={e => setImmoForm({...immoForm, goudron: e.target.value})} required />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="small text-muted mb-1 fw-bold">Valeur financière (FCFA)</label>
                      <input type="number" className="form-control form-control-sm" placeholder="Ex: 250000" value={immoForm.price} onChange={e => setImmoForm({...immoForm, price: e.target.value})} required />
                    </div>
                    {immoForm.typeTransaction === 'location' && (
                      <div className="col-md-6">
                        <label className="small text-muted mb-1">Récurrence du paiement</label>
                        <select className="form-select form-select-sm" value={immoForm.pricePeriod} onChange={e => setImmoForm({...immoForm, pricePeriod: e.target.value})}>
                          <option value="mois">Par Mois</option><option value="jour">Par Jour (Nuitée)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {immoForm.typeTransaction === 'location' && (
                    <div className="row g-3 mb-3 p-2 bg-light rounded border mx-0">
                      <div className="col-md-6">
                        <div className="form-check form-switch mt-1">
                          <input className="form-check-input" type="checkbox" id="furnishedCheck" checked={immoForm.furnished} onChange={e => setImmoForm({...immoForm, furnished: e.target.checked})} />
                          <label className="form-check-label small" htmlFor="furnishedCheck">Logement entièrement meublé</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <input type="number" className="form-control form-control-sm" placeholder="Nombre de mois d'avance (Ex: 3)" value={immoForm.numMois || ''} onChange={e => setImmoForm({...immoForm, numMois: e.target.value})} />
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Nombre de chambres</label>
                      <input type="number" className="form-control form-control-sm" value={immoForm.bedrooms} onChange={e => setImmoForm({...immoForm, bedrooms: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted mb-1">Nombre de douches</label>
                      <input type="number" className="form-control form-control-sm" value={immoForm.bathrooms} onChange={e => setImmoForm({...immoForm, bathrooms: e.target.value})} required />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="small text-muted mb-1">Description globale du bien</label>
                    <textarea className="form-control form-control-sm" rows="3" placeholder="Détails supplémentaires..." value={immoForm.description} onChange={e => setImmoForm({...immoForm, description: e.target.value})} required></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark btn-sm w-100 fw-bold">🚀 Mettre en ligne le bien immobilier</button>
                </form>
              )}
            </div>
          )}

          {/* TAB 6 : PARAMÈTRES AVANCÉS */}
          {activeTab === 'parametres' && (
            <div className="card border-0 shadow-sm p-4 bg-white mx-auto" style={{ borderRadius: '12px', maxWidth: '650px' }}>
              <h5 className="fw-bold mb-1">⚙️ Paramètres de sécurité et profil</h5>
              <p className="text-muted small mb-4">Gérez vos informations de connexion, votre sécurité et l'état de votre compte.</p>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-4 text-center bg-light p-3 rounded border">
                  <label className="small text-muted fw-bold d-block mb-3">🧑‍💻 Photo de profil</label>
                  <div className="position-relative d-inline-block">
                    <img 
                      src={profileForm.avatar} 
                      alt="Prévisualisation Profil" 
                      className="rounded-circle border border-3 border-white shadow shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-dark btn-sm rounded-circle position-absolute bottom-0 end-0 p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', border: '2px solid white' }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      📷
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <div className="mb-3">
                  <label className="small text-muted fw-bold mb-1">Nom complet / Entreprise</label>
                  <input type="text" className="form-control" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="small text-muted fw-bold mb-1">Numéro de téléphone</label>
                  <input type="text" className="form-control" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="small text-muted fw-bold mb-1">Adresse Email</label>
                  <input type="email" className="form-control" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                </div>

                <hr className="my-4 text-muted" />

                <h6 className="fw-bold text-dark mb-3">🔒 Changer le mot de passe</h6>
                <div className="mb-3">
                  <label className="small text-muted mb-1">Mot de passe actuel</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Saisissez votre mot de passe actuel" 
                    value={profileForm.currentPassword}
                    onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="small text-muted mb-1">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Nouveau mot de passe" 
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted mb-1">Confirmer le mot de passe</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Confirmer" 
                      value={profileForm.confirmPassword}
                      onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-dark btn-sm px-4 fw-bold">Sauvegarder</button>
                    <button type="button" className="btn btn-light btn-sm px-3 border" onClick={() => setActiveTab('dashboard')}>Annuler</button>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-outline-danger btn-sm fw-bold" 
                    onClick={handleDeleteAccount}
                  >
                    🗑️ Supprimer le compte
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL OVERLAY DE SPONSORISATION IMMERSIVE ================= */}
      {selectedSponsorItem && (
        <div className="modal d-flex align-items-center justify-content-center px-3" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="card border-0 shadow-lg p-4 bg-white w-100" style={{ maxWidth: '500px', borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h5 className="fw-bold text-dark mb-0">🚀 Booster votre visibilité</h5>
              <button type="button" className="btn-close border-0 bg-transparent fw-bold" onClick={() => setSelectedSponsorItem(null)}>✕</button>
            </div>
            
            <p className="text-muted small mb-3">Sponsorisez l’annonce <strong>"{selectedSponsorItem.title}"</strong>.</p>
            
            <form onSubmit={handleApplySponsor}>
              <div className="d-flex flex-column gap-2 mb-4">
                {SPONSOR_PACKS.map(pack => (
                  <label key={pack.id} className={`p-3 rounded border d-flex justify-content-between align-items-center ${chosenPackId === pack.id ? 'border-warning bg-warning bg-opacity-10 fw-bold' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-2">
                      <input type="radio" name="sponsorPackRadio" checked={chosenPackId === pack.id} onChange={() => setChosenPackId(pack.id)} />
                      <div>
                        <div className="text-dark small">{pack.name} ({pack.duration})</div>
                        <div className="text-muted fw-normal" style={{ fontSize: '11px' }}>{pack.desc}</div>
                      </div>
                    </div>
                    <span className="badge bg-dark fs-6">{pack.price.toLocaleString()} FCFA</span>
                  </label>
                ))}
              </div>

              <div className="p-3 bg-light rounded border mb-4">
                <div className="small fw-bold text-dark mb-2">📲 Mode de paiement mobile (Simulation)</div>
                <div className="d-flex gap-3 mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="payMethod" id="payOM" checked={paymentMethod === 'om'} onChange={() => setPaymentMethod('om')} />
                    <label className="form-check-label small fw-bold text-warning" htmlFor="payOM">🍊 Orange Money</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="payMethod" id="payMoMo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                    <label className="form-check-label small fw-bold text-info" htmlFor="payMoMo">💛 MTN MoMo</label>
                  </div>
                </div>
                <div>
                  <label className="small text-muted mb-1">Numéro de téléphone de débit</label>
                  <input type="tel" className="form-control form-control-sm" placeholder="Ex: 6xxxxxxxx" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning btn-sm flex-grow-1 fw-bold text-dark">Activer le Boost maintenant</button>
                <button type="button" className="btn btn-light btn-sm border" onClick={() => setSelectedSponsorItem(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserDashboard;