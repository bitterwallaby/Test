import { useRoute } from "wouter";
import { DESTINATIONS } from "@/destinations-data";
import Home from "./home";

export default function SearchResults() {
  const [match, params] = useRoute("/search/:query");
  const query = params?.query || "";

  // Exemple : filtrer par mot-clé dans le nom de la ville
  const results = DESTINATIONS.filter(d =>
    d.cityName.toLowerCase().includes(query.toLowerCase())
  );

  if (!results.length) {
    return (
      <div>
        <h2>Aucune destination trouvée pour "{query}"</h2>
        <p>Essayez d'augmenter votre budget ou modifier vos critères.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Résultats pour "{query}"</h2>
      <ul>
        {results.map(d => (
          <li key={d.iataCode}>
            {d.cityName}, {d.countryName} (Score: {d.uniquenessScore})
          </li>
        ))}
      </ul>
    </div>
  );
}
