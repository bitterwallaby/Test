import { useRoute } from "wouter";
import { DESTINATIONS } from "@/destinations-data";

export default function SearchResults() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const destinations = params.get("destinations")?.split(",") || [];

  return (
    <div>
      <h2>Résultats</h2>
      <ul>
        {destinations.map(d => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}
