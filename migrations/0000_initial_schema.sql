/*
  # Initial Schema for Discovery Flights Flex

  1. New Tables
    - `searches`
      - `id` (varchar, primary key, UUID)
      - `name` (text) - Nom descriptif de la recherche
      - `origin_airport` (text) - Code IATA de l'aéroport de départ
      - `budget` (integer) - Budget maximum en euros
      - `pattern` (jsonb) - Pattern de disponibilité flexible
      - `selected_destinations` (jsonb) - Codes IATA des destinations sélectionnées
      - `max_distance` (integer) - Distance maximale en km
      - `is_active` (boolean) - Statut actif/inactif
      - `email` (text) - Email pour les alertes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `alerts`
      - `id` (varchar, primary key, UUID)
      - `search_id` (varchar) - Référence à la recherche
      - `destination` (text) - Code IATA de la destination
      - `current_price` (integer) - Prix actuel
      - `target_price` (integer) - Prix cible
      - `price_change` (integer) - Pourcentage de changement
      - `flight_details` (jsonb) - Détails du vol
      - `sent` (boolean) - Statut d'envoi
      - `created_at` (timestamptz)

    - `price_history`
      - `id` (varchar, primary key, UUID)
      - `search_id` (varchar) - Référence à la recherche
      - `destination` (text) - Code IATA
      - `price` (integer) - Prix enregistré
      - `currency` (text) - Devise
      - `date` (text) - Date du vol
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access (to be refined based on auth strategy)
*/

-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  origin_airport TEXT NOT NULL,
  budget INTEGER NOT NULL,
  pattern JSONB NOT NULL,
  selected_destinations JSONB,
  max_distance INTEGER,
  is_active BOOLEAN DEFAULT true,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  search_id VARCHAR NOT NULL,
  destination TEXT NOT NULL,
  current_price INTEGER NOT NULL,
  target_price INTEGER NOT NULL,
  price_change INTEGER,
  flight_details JSONB,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  search_id VARCHAR NOT NULL,
  destination TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL,
  date TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for searches (allow all for now - to be refined)
CREATE POLICY "Allow public read access to searches"
  ON searches FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to searches"
  ON searches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to searches"
  ON searches FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to searches"
  ON searches FOR DELETE
  USING (true);

-- Create policies for alerts
CREATE POLICY "Allow public read access to alerts"
  ON alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to alerts"
  ON alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to alerts"
  ON alerts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to alerts"
  ON alerts FOR DELETE
  USING (true);

-- Create policies for price_history
CREATE POLICY "Allow public read access to price_history"
  ON price_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to price_history"
  ON price_history FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_searches_email ON searches(email);
CREATE INDEX IF NOT EXISTS idx_searches_is_active ON searches(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_search_id ON alerts(search_id);
CREATE INDEX IF NOT EXISTS idx_alerts_sent ON alerts(sent);
CREATE INDEX IF NOT EXISTS idx_price_history_search_id ON price_history(search_id);
CREATE INDEX IF NOT EXISTS idx_price_history_destination ON price_history(destination);
