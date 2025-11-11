import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  nav: {
    home: string;
    news: string;
    latestNews: string;
    stats: string;
    betting: string;
    gambling: string;
    divisions: string;
    teamStats: string;
    playerStats: string;
    myBets: string;
    scorePredictions: string;
    leaderboard: string;
    signIn: string;
    signOut: string;
    admin: string;
  };
  home: {
    title: string;
    welcome: string;
  };
  divisions: {
    title: string;
    team: string;
    gp: string;
    record: string;
    points: string;
  };
  teamStats: {
    title: string;
    team: string;
    gp: string;
    wins: string;
    losses: string;
    otLosses: string;
    points: string;
    goalsFor: string;
    goalsAgainst: string;
  };
  playerStats: {
    title: string;
    player: string;
    team: string;
    position: string;
    gp: string;
    goals: string;
    assists: string;
    points: string;
  };
  betting: {
    title: string;
    availableCurrency: string;
    betAmount: string;
    betOn: string;
    bettingClosed: string;
    predictScore: string;
    submitPrediction: string;
    betPlaced: string;
    invalidAmount: string;
    alreadyPredicted: string;
    enterValidScores: string;
    predictionSubmitted: string;
    failedBet: string;
    failedPrediction: string;
  };
  myBets: {
    title: string;
    game: string;
    betOn: string;
    amount: string;
    status: string;
    result: string;
    pending: string;
    won: string;
    lost: string;
    noBets: string;
  };
  scorePredictions: {
    title: string;
    game: string;
    prediction: string;
    actual: string;
    status: string;
    points: string;
    pending: string;
    correct: string;
    incorrect: string;
    noPredictions: string;
    edit: string;
    save: string;
    cancel: string;
  };
  leaderboard: {
    title: string;
    rank: string;
    player: string;
    currency: string;
    predictions: string;
  };
  profile: {
    title: string;
    displayName: string;
    email: string;
    currency: string;
    save: string;
    updated: string;
    failed: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    displayName: string;
    alreadyAccount: string;
    noAccount: string;
  };
  admin: {
    title: string;
    updateScores: string;
    gameId: string;
    homeScore: string;
    awayScore: string;
    update: string;
    updated: string;
    failed: string;
  };
  common: {
    loading: string;
    vs: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      news: 'News',
      latestNews: 'Latest news',
      stats: 'Stats',
      betting: 'Gambling',
      gambling: 'Place your bets',
      divisions: 'Divisions',
      teamStats: 'Teams',
      playerStats: 'Players',
      myBets: 'My Bets',
      scorePredictions: 'My Predictions',
      leaderboard: 'Leaderboard',
      signIn: 'Sign in',
      signOut: 'Sign out',
      admin: 'Admin',
    },
    home: {
      title: 'NHL Stats & Betting',
      welcome: 'Welcome to NHL Stats',
    },
    divisions: {
      title: 'Division Standings',
      team: 'Team',
      gp: 'GP',
      record: 'W-L-OT',
      points: 'Points',
    },
    teamStats: {
      title: 'Team Statistics',
      team: 'Team',
      gp: 'GP',
      wins: 'W',
      losses: 'L',
      otLosses: 'OT',
      points: 'PTS',
      goalsFor: 'GF',
      goalsAgainst: 'GA',
    },
    playerStats: {
      title: 'Player Statistics',
      player: 'Player',
      team: 'Team',
      position: 'Pos',
      gp: 'GP',
      goals: 'G',
      assists: 'A',
      points: 'PTS',
    },
    betting: {
      title: 'Place Your Bets',
      availableCurrency: 'Available Currency',
      betAmount: 'Bet amount',
      betOn: 'Bet on',
      bettingClosed: 'Betting closed',
      predictScore: 'Predict Final Score (MTL Game)',
      submitPrediction: 'Submit Prediction',
      betPlaced: 'Bet placed successfully!',
      invalidAmount: 'Invalid bet amount',
      alreadyPredicted: 'You already have a prediction for this game. Use the My Predictions page to edit it.',
      enterValidScores: 'Please enter valid scores',
      predictionSubmitted: 'Score prediction submitted!',
      failedBet: 'Failed to place bet',
      failedPrediction: 'Failed to submit prediction',
    },
    myBets: {
      title: 'My Bets',
      game: 'Game',
      betOn: 'Bet on',
      amount: 'Amount',
      status: 'Status',
      result: 'Result',
      pending: 'Pending',
      won: 'Won',
      lost: 'Lost',
      noBets: 'No bets placed yet',
    },
    scorePredictions: {
      title: 'My Score Predictions',
      game: 'Game',
      prediction: 'Prediction',
      actual: 'Actual',
      status: 'Status',
      points: 'Points',
      pending: 'Pending',
      correct: 'Correct',
      incorrect: 'Incorrect',
      noPredictions: 'No predictions yet',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
    },
    leaderboard: {
      title: 'Leaderboard',
      rank: 'Rank',
      player: 'Player',
      currency: 'Millcoins',
      predictions: 'Predictions',
    },
    profile: {
      title: 'Profile',
      displayName: 'Display Name',
      email: 'Email',
      currency: 'Millcoins',
      save: 'Save',
      updated: 'Profile updated!',
      failed: 'Failed to update profile',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      displayName: 'Display Name',
      alreadyAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
    },
    admin: {
      title: 'Admin - Update Game Scores',
      updateScores: 'Update Game Scores',
      gameId: 'Game ID',
      homeScore: 'Home Score',
      awayScore: 'Away Score',
      update: 'Update',
      updated: 'Scores updated successfully!',
      failed: 'Failed to update scores',
    },
    common: {
      loading: 'Loading...',
      vs: 'vs',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      news: 'Nouvelles',
      latestNews: 'À la une',
      stats: 'Statistiques',
      betting: 'Bets',
      gambling: 'Placez vos bets',
      divisions: 'Divisions',
      teamStats: 'Équipes',
      playerStats: 'Joueurs',
      myBets: 'Mes bets',
      scorePredictions: 'Mes prédictions',
      leaderboard: 'Classement',
      signIn: 'Connexion',
      signOut: 'Déconnexion',
      admin: 'Admin',
    },
    home: {
      title: 'Stats & Paris LNH',
      welcome: 'Bienvenue aux Stats LNH',
    },
    divisions: {
        title: 'Classement par division',
      team: 'Équipe',
      gp: 'PJ',
      record: 'V-D-DP',
      points: 'Points',
    },
    teamStats: {
      title: 'Statistiques des équipes',
      team: 'Équipe',
      gp: 'PJ',
      wins: 'V',
      losses: 'D',
      otLosses: 'DP',
      points: 'PTS',
      goalsFor: 'BP',
      goalsAgainst: 'BC',
    },
    playerStats: {
      title: 'Statistiques des joueurs',
      player: 'Joueur',
      team: 'Équipe',
      position: 'Pos',
      gp: 'PJ',
      goals: 'B',
      assists: 'A',
      points: 'PTS',
    },
    betting: {
        title: 'Placez vos bets',
      availableCurrency: 'Monnaie disponible ',
      betAmount: 'Montant du bet',
      betOn: 'Parier sur',
      bettingClosed: 'Paris fermés',
      predictScore: 'Prédire le Score Final (Match MTL)',
      submitPrediction: 'Soumettre la Prédiction',
      betPlaced: 'Pari placé avec succès!',
      invalidAmount: 'Montant de pari invalide',
      alreadyPredicted: 'Vous avez déjà une prédiction pour ce match. Utilisez la page Mes Prédictions pour la modifier.',
      enterValidScores: 'Veuillez entrer des scores valides',
      predictionSubmitted: 'Prédiction de score soumise!',
      failedBet: 'Échec du placement du pari',
      failedPrediction: 'Échec de la soumission de la prédiction',
    },
    myBets: {
      title: 'Mes bets',
      game: 'Match',
      betOn: 'Bet pour',
      amount: 'Montant',
      status: 'Résultat',
      result: 'Résultat',
      pending: 'En attente',
      won: 'Gagné',
      lost: 'Perdu',
      noBets: 'Aucun pari placé',
    },
    scorePredictions: {
      title: 'Mes prédictions',
      game: 'Match',
      prediction: 'Prédiction',
      actual: 'Réel',
      status: 'Résultat',
      points: 'Points',
      pending: 'En attente',
      correct: 'Correct',
      incorrect: 'Incorrect',
      noPredictions: 'Aucune prédiction',
      edit: 'Modifier',
      save: 'Sauvegarder',
      cancel: 'Annuler',
    },
    leaderboard: {
      title: 'Classement',
      rank: 'Rang',
      player: 'Joueur',
      currency: 'Millcoins',
      predictions: 'Prédictions',
    },
    profile: {
      title: 'Profil',
      displayName: "Nom d'affichage",
      email: 'Courriel',
      currency: 'Millcoins',
      save: 'Sauvegarder',
      updated: 'Profil mis à jour!',
      failed: 'Échec de la mise à jour du profil',
    },
    auth: {
      signIn: 'Connexion',
      signUp: 'Inscription',
      email: 'Courriel',
      password: 'Mot de passe',
      displayName: "Nom d'affichage",
      alreadyAccount: 'Vous avez déjà un compte?',
      noAccount: "Vous n'avez pas de compte?",
    },
    admin: {
      title: 'Admin - Mettre à Jour les Scores',
      updateScores: 'Mettre à Jour les Scores',
      gameId: 'ID du Match',
      homeScore: 'Score Domicile',
      awayScore: 'Score Visiteur',
      update: 'Mettre à jour',
      updated: 'Scores mis à jour avec succès!',
      failed: 'Échec de la mise à jour des scores',
    },
    common: {
      loading: 'Chargement...',
      vs: 'vs',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
