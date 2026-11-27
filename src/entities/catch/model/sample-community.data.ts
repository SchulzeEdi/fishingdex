import type { CommunityCatch } from './catch';

// Capturas de EXEMPLO da comunidade, só para o feed/ranking terem conteúdo enquanto a camada
// HTTP não liga o app ao backend (DT-04). Substituir por getFeed/getRanking da API.
const HOUR = 3_600_000;

interface Seed extends Omit<CommunityCatch, 'caughtAt' | 'userId' | 'isPrivate'> {
  hoursAgo: number;
  isPrivate?: boolean;
}

const SEED: readonly Seed[] = [
  { id: 's1', authorName: 'Rafael Souza', authorCountry: 'BR', speciesId: 'tucunare-acu', sizeCm: 62, weightKg: 3.4, bait: 'Zara', place: 'Rio Araguaia, GO', likes: 24, hoursAgo: 2 },
  { id: 's2', authorName: 'Ana Ruiz', authorCountry: 'AR', speciesId: 'dourado', sizeCm: 58, bait: 'Cucharita', likes: 12, hoursAgo: 26, isPrivate: true },
  { id: 's3', authorName: 'Mike Kowalski', authorCountry: 'US', speciesId: 'black-bass', sizeCm: 71, weightKg: 5.1, bait: 'Senko', place: 'Lake Fork, TX', likes: 40, hoursAgo: 50 },
  { id: 's4', authorName: 'João Pereira', authorCountry: 'BR', speciesId: 'pintado', sizeCm: 54, bait: 'Tuvira', place: 'Rio Paraná, MS', likes: 9, hoursAgo: 96 },
  { id: 's5', authorName: 'Lucía Fernández', authorCountry: 'AR', speciesId: 'pacu', sizeCm: 51, place: 'Río Paraná, Corrientes', likes: 15, hoursAgo: 150 },
  { id: 's6', authorName: 'Carla Mendes', authorCountry: 'BR', speciesId: 'robalo', sizeCm: 88, weightKg: 7.2, bait: 'Shad', place: 'Ilha do Mel, PR', likes: 31, hoursAgo: 240 },
  { id: 's7', authorName: 'Diego Paz', authorCountry: 'AR', speciesId: 'truta-arco-iris', sizeCm: 64, bait: 'Mosca', place: 'Río Chimehuín, Neuquén', likes: 22, hoursAgo: 330 },
  { id: 's8', authorName: 'Sam Carter', authorCountry: 'US', speciesId: 'red-drum', sizeCm: 96, bait: 'Gold spoon', place: 'Mosquito Lagoon, FL', likes: 18, hoursAgo: 480 },
  { id: 's9', authorName: 'Bruno Lima', authorCountry: 'BR', speciesId: 'tambaqui', sizeCm: 78, place: 'Lago de Balbina, AM', likes: 7, hoursAgo: 960 },
  { id: 's10', authorName: 'Paula Rocha', authorCountry: 'BR', speciesId: 'dourado-do-mar', sizeCm: 112, bait: 'Lula', place: 'Ilhabela, SP', likes: 27, hoursAgo: 2900 },
  { id: 's11', authorName: 'Tom Becker', authorCountry: 'US', speciesId: 'muskellunge', sizeCm: 121, bait: 'Bucktail', place: 'Lake of the Woods, MN', likes: 52, hoursAgo: 7200 },
];

/** Exemplos com datas relativas a `now` (não envelhecem). */
export function sampleCommunityCatches(now: Date = new Date()): CommunityCatch[] {
  return SEED.map(({ hoursAgo, isPrivate, ...rest }) => ({
    ...rest,
    userId: `sample-${rest.id}`,
    isPrivate: isPrivate ?? false,
    caughtAt: new Date(now.getTime() - hoursAgo * HOUR).toISOString(),
  }));
}
