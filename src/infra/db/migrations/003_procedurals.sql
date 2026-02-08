-- Procedural generation tables

-- === Procedurals ===
CREATE SCHEMA IF NOT EXISTS procedurals;

CREATE TABLE IF NOT EXISTS procedurals.galaxies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  owner_id uuid NOT NULL REFERENCES auth.users (id),
  name non_empty_text NOT NULL CHECK (name ~ '^[[:alnum:]-]{5,15}$'),
  shape procedurals.galaxy_shapes NOT NULL,
  system_count integer NOT NULL CHECK (system_count >= 1 AND system_count <= 1000),
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_galaxies_owner ON procedurals.galaxies (owner_id);

CREATE TABLE IF NOT EXISTS procedurals.systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  galaxy_id uuid NOT NULL REFERENCES procedurals.galaxies (id) ON DELETE CASCADE,
  name non_empty_text NOT NULL CHECK (name ~ '^[[:alnum:]-]{3,25}$'),
  position_x double precision NOT NULL,
  position_y double precision NOT NULL,
  position_z double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_systems_galaxy ON procedurals.systems (galaxy_id);

CREATE TABLE IF NOT EXISTS procedurals.stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  system_id uuid NOT NULL REFERENCES procedurals.systems (id) ON DELETE CASCADE,
  name non_empty_text NOT NULL CHECK (name ~ '^[[:alnum:]-]{3,25}$'),
  star_type procedurals.star_types NOT NULL,
  star_class procedurals.star_classes NOT NULL,
  surface_temperature numeric NOT NULL CHECK (surface_temperature > 0),
  color non_empty_text NOT NULL,
  relative_mass numeric NOT NULL CHECK (relative_mass > 0),
  absolute_mass numeric NOT NULL CHECK (absolute_mass > 0),
  relative_radius numeric NOT NULL CHECK (relative_radius > 0),
  absolute_radius numeric NOT NULL CHECK (absolute_radius > 0),
  gravity numeric NOT NULL CHECK (gravity > 0),
  is_main boolean NOT NULL DEFAULT true,
  orbital numeric NOT NULL DEFAULT 0 CHECK (orbital >= 0),
  orbital_starter numeric NOT NULL DEFAULT 0 CHECK (orbital_starter >= 0),
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_stars_system ON procedurals.stars (system_id);

CREATE TABLE IF NOT EXISTS procedurals.planets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  system_id uuid NOT NULL REFERENCES procedurals.systems (id) ON DELETE CASCADE,
  name non_empty_text NOT NULL CHECK (name ~ '^[[:alnum:]-]{3,25}$'),
  type procedurals.planet_types NOT NULL,
  size procedurals.planet_sizes NOT NULL,
  orbital numeric NOT NULL CHECK (orbital > 0),
  biome procedurals.planet_biomes NOT NULL,
  relative_mass numeric NOT NULL CHECK (relative_mass > 0),
  absolute_mass numeric NOT NULL CHECK (absolute_mass > 0),
  relative_radius numeric NOT NULL CHECK (relative_radius > 0),
  absolute_radius numeric NOT NULL CHECK (absolute_radius > 0),
  gravity numeric NOT NULL CHECK (gravity >= 0),
  temperature numeric NOT NULL CHECK (temperature > 0),
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_planets_system ON procedurals.planets (system_id);

CREATE TABLE IF NOT EXISTS procedurals.moons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  system_id uuid NOT NULL REFERENCES procedurals.systems (id) ON DELETE CASCADE,
  name non_empty_text NOT NULL CHECK (name ~ '^[[:alnum:]-]{3,25}$'),
  size procedurals.moon_sizes NOT NULL,
  orbital numeric NOT NULL CHECK (orbital > 0),
  relative_mass numeric NOT NULL CHECK (relative_mass > 0),
  absolute_mass numeric NOT NULL CHECK (absolute_mass > 0),
  relative_radius numeric NOT NULL CHECK (relative_radius > 0),
  absolute_radius numeric NOT NULL CHECK (absolute_radius > 0),
  gravity numeric NOT NULL CHECK (gravity >= 0),
  temperature numeric NOT NULL CHECK (temperature > 0),
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_moons_system ON procedurals.moons (system_id);

CREATE TABLE IF NOT EXISTS procedurals.asteroids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  system_id uuid NOT NULL REFERENCES procedurals.systems (id) ON DELETE CASCADE,
  name non_empty_text NOT NULL CHECK (name ~ '^[[:upper:]-]+-[0-9]{3}$'),
  type procedurals.asteroid_types NOT NULL,
  size procedurals.asteroid_sizes NOT NULL,
  orbital numeric NOT NULL CHECK (orbital > 0 AND mod(orbital * 2, 2) = 1),
  created_at timestamptz NOT NULL DEFAULT now_utc (),
  updated_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_asteroids_system ON procedurals.asteroids (system_id);

-- === Triggers for updated_at ===
DROP TRIGGER IF EXISTS trg_galaxies_updated_at ON procedurals.galaxies;
CREATE TRIGGER trg_galaxies_updated_at
BEFORE UPDATE ON procedurals.galaxies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_systems_updated_at ON procedurals.systems;
CREATE TRIGGER trg_systems_updated_at
BEFORE UPDATE ON procedurals.systems
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_stars_updated_at ON procedurals.stars;
CREATE TRIGGER trg_stars_updated_at
BEFORE UPDATE ON procedurals.stars
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_planets_updated_at ON procedurals.planets;
CREATE TRIGGER trg_planets_updated_at
BEFORE UPDATE ON procedurals.planets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_moons_updated_at ON procedurals.moons;
CREATE TRIGGER trg_moons_updated_at
BEFORE UPDATE ON procedurals.moons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_asteroids_updated_at ON procedurals.asteroids;
CREATE TRIGGER trg_asteroids_updated_at
BEFORE UPDATE ON procedurals.asteroids
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
