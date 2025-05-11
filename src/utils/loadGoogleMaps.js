let isScriptLoaded = false;
let isScriptLoading = false;
let loadPromise = null;

export function loadGoogleMaps(apiKey) {
  if (typeof window.google !== "undefined") {
    // Si Google est déjà chargé, on retourne la promesse résolue
    return Promise.resolve(window.google);
  }

  if (isScriptLoaded) {
    // Si le script est déjà chargé, simplement renvoyer la promesse existante
    return loadPromise;
  }

  if (!isScriptLoading) {
    // Si le script est en cours de chargement, attendre qu'il soit chargé
    isScriptLoading = true;
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          isScriptLoaded = true;
          resolve(window.google); // Résoudre avec google
        } else {
          reject(
            new Error(
              "google.maps n'est pas défini après le chargement du script."
            )
          );
        }
      };

      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
