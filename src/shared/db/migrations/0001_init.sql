-- Migration inicial do fishingdex (ADR-0007 PostGIS; ADR-0005 B2C).
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  name text NOT NULL,
  avatar_url text,
  country text,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fish_species (
  id text PRIMARY KEY,
  name_pt text NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  scientific_name text NOT NULL,
  habitat text NOT NULL,
  rarity text NOT NULL,
  regions text[] NOT NULL,
  max_plausible_size_cm integer NOT NULL,
  max_plausible_weight_kg real
);

CREATE TABLE IF NOT EXISTS catches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species_id text NOT NULL REFERENCES fish_species(id),
  photo_url text,
  size_cm real NOT NULL,
  weight_kg real,
  caught_at timestamptz NOT NULL DEFAULT now(),
  lat double precision,
  lng double precision,
  geom geometry(Point, 4326),
  is_private boolean NOT NULL DEFAULT false,
  bait text, rod text, reel text, line text
);
CREATE INDEX IF NOT EXISTS catches_user_idx ON catches(user_id);
CREATE INDEX IF NOT EXISTS catches_species_idx ON catches(species_id);
CREATE INDEX IF NOT EXISTS catches_size_idx ON catches(size_cm DESC);
CREATE INDEX IF NOT EXISTS catches_geom_gix ON catches USING GIST(geom);

CREATE TABLE IF NOT EXISTS dex_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species_id text NOT NULL REFERENCES fish_species(id),
  first_catch_id uuid REFERENCES catches(id) ON DELETE SET NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS dex_user_species_uniq ON dex_unlocks(user_id, species_id);

CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id);

CREATE TABLE IF NOT EXISTS likes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catch_id uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, catch_id)
);
CREATE INDEX IF NOT EXISTS likes_catch_idx ON likes(catch_id);

CREATE TABLE IF NOT EXISTS fisheries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point, 4326),
  species text[] NOT NULL DEFAULT '{}',
  photos text[] NOT NULL DEFAULT '{}',
  whatsapp text,
  description text,
  listing_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fisheries_geom_gix ON fisheries USING GIST(geom);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catch_id uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_catch_idx ON reports(catch_id);

-- Mantém geom sincronizado com lat/lng (defesa em profundidade além da aplicação).
CREATE OR REPLACE FUNCTION sync_geom() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catches_geom_sync ON catches;
CREATE TRIGGER catches_geom_sync BEFORE INSERT OR UPDATE ON catches
  FOR EACH ROW EXECUTE FUNCTION sync_geom();
DROP TRIGGER IF EXISTS fisheries_geom_sync ON fisheries;
CREATE TRIGGER fisheries_geom_sync BEFORE INSERT OR UPDATE ON fisheries
  FOR EACH ROW EXECUTE FUNCTION sync_geom();
