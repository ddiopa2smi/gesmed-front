import StatistiquesPharmacieComponent from "../../components/specific/StatistiquesPharmacie/StatistiquesPharmacie";
import AccesReserve from "../../components/common/AccesReserve/AccesReserve";

// Statistiques de gestion de la pharmacie : réservées aux profils définis dans ACCES_STATISTIQUES (utils/profils)
function StatistiquesPharmacie() {
  return (
    <AccesReserve espace="pharmacie" message="Les statistiques de la pharmacie sont accessibles uniquement aux gérants et aux administrateurs.">
      <StatistiquesPharmacieComponent />
    </AccesReserve>
  );
}

export default StatistiquesPharmacie;
