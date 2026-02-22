# ORBITALS

Some aggregates work with orbitals:

- Stars: from 0 (center) to 1 (orbiting center). Main star is always in orbital 0, the rest relies in 1.
- Planets: from 1 to 8. Each type of star defines the first orbital allowed (orbitalStarter). The bigger the star, the bigger this number (planets start orbiting farther).
- Moons: from 1 to 5 being 0 the planet who orbits. 1 more close, 5 more far from the planet.
- Asteroids: always orbitates on .5 numbers (1.5, 2.5, 3.5 and so on...). 0.5 is the closest orbital to the main star.

The orbital system is designed in order to avoid collides between entities in the visualization.

# SYSTEMS

Min 1 system per galaxy, max 1000.
System coordinates must be based on galaxy shape (in order to ensure shape stays real in client visualization).

# STARS

Min 1 star per system, max 3.
If a star is a black hole or a neutron star the max always will be 1.
The most massive star remains as main star of system with orbital 0, the others isMain = false and orbital 1.
The selection of the star type are based on probabilities defined into 'const STAR_PROBABILITIES'. Once this is selected the other parameters fall into a range (already defined).

# PLANETS, MOONS AND ASTEROIDS

Max number of asteroids is star (9 - orbitalStarter + 0.5) to ensure that max are 8 asteroids per system always that the orbitalStarter is 1
Max number of planets per system is 8, min 0.
Max number of moons per planet is 5, min 0.
Max and mins are always based on star orbitalStarter.
The props of the entities will be procedural and based on the constants and ranges already defined in domain layer (each aggregate have his own).

# IMPLEMENTATION NOTES (CURRENT)

- Galaxy create/delete are transactional with UoW. Any failure in a nested aggregate rolls back the full operation.
- Systems are generated using galaxy shape:
  - `spherical`: 3D sphere distribution.
  - `3-arm spiral` / `5-arm spiral`: arm-based radial distribution.
  - `irregular`: scattered cloud distribution.
- `orbitalStarter` is derived from main star type:
  - Blue supergiant: 4
  - Blue giant: 3
  - White dwarf: 2
  - Brown dwarf: 1
  - Yellow dwarf: 1
  - Subdwarf: 2
  - Red dwarf: 1
  - Black hole: 5
  - Neutron star: 4
- Planet count is generated from `orbitalStarter` and constrained to valid orbitals: `0..(9 - orbitalStarter)`, orbitals always in `[orbitalStarter..8]`.
- Asteroid count is generated from `orbitalStarter`: `0..(9 - orbitalStarter)`, orbitals always in half-steps `[orbitalStarter + 0.5 .. 8.5]`.
- Moon count is generated from `orbitalStarter` and capped in `0..5`.
