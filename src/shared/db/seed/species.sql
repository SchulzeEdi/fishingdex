-- Seed regionalizado de espécies (D-11/D-14). Curadoria completa depois.
INSERT INTO fish_species (id, name_pt, name_es, name_en, scientific_name, habitat, rarity, regions, max_plausible_size_cm, max_plausible_weight_kg) VALUES
  ('tucunare-acu','Tucunaré-açu','Tucunaré','Speckled peacock bass','Cichla temensis','freshwater','rare','{BR}',100,14),
  ('dourado','Dourado','Dorado','Golden dorado','Salminus brasiliensis','freshwater','uncommon','{BR,AR}',100,30),
  ('tilapia','Tilápia','Tilapia','Nile tilapia','Oreochromis niloticus','freshwater','common','{BR,US}',60,5),
  ('black-bass','Black bass','Lobina negra','Largemouth bass','Micropterus salmoides','freshwater','uncommon','{US,BR}',75,10),
  ('robalo','Robalo','Róbalo','Common snook','Centropomus undecimalis','saltwater','uncommon','{BR,US}',140,25),
  ('dourado-do-mar','Dourado-do-mar','Dorado de mar','Mahi-mahi','Coryphaena hippurus','saltwater','rare','{BR,US,AR}',210,40)
ON CONFLICT (id) DO NOTHING;
