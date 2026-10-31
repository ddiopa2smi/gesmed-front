import StatistiquesMedicalesComponent from "../../components/specific/StatistiquesMedicales/StatistiquesMedicales";
import AccesReserve from "../../components/common/AccesReserve/AccesReserve";

// Statistiques médicales : réservées aux profils définis dans ACCES_STATISTIQUES (utils/profils)
function StatistiquesMedicales() {
  return (
    <AccesReserve espace="medical" message="Les statistiques médicales sont accessibles uniquement aux médecins et aux administrateurs.">
      <StatistiquesMedicalesComponent />
    </AccesReserve>
  );
}

export default StatistiquesMedicales;
