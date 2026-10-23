/**
 * Règles de prix des médicaments, communes aux ordonnances internes et externes.
 */

// Prix unitaire d'un produit : le prix de vente pour les produits distribués en boîtes,
// sinon (prix de vente / quantité d'emballage).
// Sans quantité d'emballage renseignée, on retombe sur le prix de vente.
export const getPrixUnitaire = (produit) => {
    const prixVente = produit?.prix_vente || 0;
    if (produit?.unite_distribution !== "Boîtes" && produit?.qte_emb > 0) {
        return prixVente / produit.qte_emb;
    }
    return prixVente;
};

// Montant d'une ligne (prix unitaire x quantité) arrondi au franc supérieur
export const getMontantLigne = (produit, quantite) =>
    Math.ceil(getPrixUnitaire(produit) * (quantite || 0));
