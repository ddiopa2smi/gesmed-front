import { Button, Card, Result } from "antd";
import { useNavigate } from "react-router";
import { peutVoirStatistiques } from "../../../utils/profils";

// Affiche children seulement si l'utilisateur a le droit de voir les statistiques de l'espace
function AccesReserve({ espace, message, children }) {
  const navigate = useNavigate();
  if (peutVoirStatistiques(espace)) return children;
  return (
    <Card>
      <Result
        status="403"
        title="Accès réservé"
        subTitle={message}
        extra={<Button type="primary" onClick={() => navigate(-1)}>Retour</Button>}
      />
    </Card>
  );
}

export default AccesReserve;
