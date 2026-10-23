import { Button, Card, Result } from "antd";
import { useNavigate } from "react-router";
import StatistiquesMedicalesComponent from "../../components/specific/StatistiquesMedicales/StatistiquesMedicales";
import { isMedecinOuAdmin } from "../../utils/profils";

// Statistiques médicales : réservées aux médecins et aux administrateurs
function StatistiquesMedicales() {
  const navigate = useNavigate();

  if (!isMedecinOuAdmin()) {
    return (
      <Card>
        <Result
          status="403"
          title="Accès réservé"
          subTitle="Les statistiques médicales sont accessibles uniquement aux médecins et aux administrateurs."
          extra={<Button type="primary" onClick={() => navigate(-1)}>Retour</Button>}
        />
      </Card>
    );
  }

  return <StatistiquesMedicalesComponent />;
}

export default StatistiquesMedicales;
