/**
 * Règles de prix des médicaments, communes aux ordonnances internes et externes.
 */

// Produit distribué en boîtes ? Comparaison tolérante aux accents : en base, des libellés
// ont été enregistrés avec un caractère invalide à la place de l'accent ("Bo�tes").
export const estVenduEnBoite = (produit) =>
    /^bo.?tes?$/i.test(String(produit?.unite_distribution || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim());

// Prix unitaire d'un produit : le prix de vente pour les produits distribués en boîtes,
// sinon (prix de vente / quantité d'emballage).
// Sans quantité d'emballage renseignée, on retombe sur le prix de vente.
export const getPrixUnitaire = (produit) => {
    const prixVente = produit?.prix_vente || 0;
    if (!estVenduEnBoite(produit) && produit?.qte_emb > 0) {
        return prixVente / produit.qte_emb;
    }
    return prixVente;
};

// Montant d'une ligne (prix unitaire x quantité) arrondi au franc supérieur
export const getMontantLigne = (produit, quantite) =>
    Math.ceil(getPrixUnitaire(produit) * (quantite || 0));
