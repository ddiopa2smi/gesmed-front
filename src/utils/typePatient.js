// Couleur stable par type de patient (basée sur un hash du libellé, pour rester cohérente
// quel que soit le libellé exact renvoyé par le back-end). Utilisée par toutes les listes.
const TYPE_TAG_COLORS = ["blue", "green", "gold", "volcano", "purple", "geekblue", "magenta", "cyan", "orange", "lime"];

export const getTypeColor = (value) => {
  if (!value) return "default";
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TYPE_TAG_COLORS[Math.abs(hash) % TYPE_TAG_COLORS.length];
};
