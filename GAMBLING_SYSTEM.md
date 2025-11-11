# Système de Gambling avec Odds

## Vue d'ensemble
Le système de gambling utilise maintenant des **odds (cotes)** basés sur les points des équipes dans les classements de division.

## Comment ça fonctionne

### Calcul des Odds
Les odds sont calculés automatiquement selon la formule:
```
odds = 2.0 - (points_équipe - points_adversaire) × 0.02
```

- **Équipe favorite** (plus de points) → odds plus bas (ex: 1.50x)
- **Équipe défavorisée** (moins de points) → odds plus élevés (ex: 2.50x)
- **Odds minimum**: 1.10x
- **Odds maximum**: 5.00x

### Exemple
Si Montréal (60 points) joue contre Toronto (50 points):
- **Montréal**: 2.0 - (60-50) × 0.02 = 1.80x
- **Toronto**: 2.0 - (50-60) × 0.02 = 2.20x

### Gains
Quand vous gagnez un pari:
```
Gain total = Mise × Odds
Profit = Gain total - Mise
```

Exemple: Pari de 100 MC sur Toronto @ 2.20x
- **Si vous gagnez**: Vous recevez 220 MC (profit de 120 MC)
- **Si vous perdez**: Vous perdez votre mise de 100 MC

## Affichage
- Les odds sont affichés en **vert** sous chaque équipe dans la page Betting
- Dans MyBets, vous voyez:
  - La cote de votre pari
  - Le gain potentiel si vous gagnez

## Migration Base de Données
Exécutez le fichier SQL `add_odds_column.sql` dans Supabase pour ajouter la colonne odds:
```sql
ALTER TABLE bets ADD COLUMN IF NOT EXISTS odds DECIMAL(4,2) DEFAULT 2.0;
```
