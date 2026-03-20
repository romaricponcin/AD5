/* ============================================================
   STATE — État global partagé entre tous les modules
   Utilise un objet unique pour permettre les mutations en place.
   ============================================================ */

export const state = {
  CURRENT_USER: null,     // UUID de l'utilisateur courant
  QUESTION_BANK: [],      // Banque globale (JSON + custom)
  quizState: null,        // État du quiz en cours
  calendarDate: new Date(), // Date affichée dans le calendrier
  currentView: 'dashboard'
};
