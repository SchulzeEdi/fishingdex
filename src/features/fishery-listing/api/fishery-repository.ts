import { eq, sql } from 'drizzle-orm';

import type { Db } from '@/shared/db/client';
import { fisheries } from '@/shared/db/schema';

export interface CreateFisheryInput {
  ownerId: string;
  name: string;
  lat: number;
  lng: number;
  species?: string[];
  photos?: string[];
  whatsapp?: string;
  description?: string;
  listingActive?: boolean;
}

export interface NearbyFishery {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  whatsapp: string | null;
  species: string[];
}

/** Persistência + busca geoespacial de pesqueiros (ADR-0007 PostGIS). */
export class FisheryRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateFisheryInput): Promise<string> {
    const [row] = await this.db
      .insert(fisheries)
      .values({
        ownerId: input.ownerId,
        name: input.name,
        lat: input.lat,
        lng: input.lng,
        species: input.species ?? [],
        photos: input.photos ?? [],
        whatsapp: input.whatsapp ?? null,
        description: input.description ?? null,
        listingActive: input.listingActive ?? false,
      })
      .returning({ id: fisheries.id });
    if (!row) throw new Error('falha ao criar pesqueiro');
    return row.id;
  }

  async setListingActive(id: string, active: boolean): Promise<void> {
    await this.db.update(fisheries).set({ listingActive: active }).where(eq(fisheries.id, id));
  }

  /** Pesqueiros ativos dentro de `radiusKm`, ordenados por distância (ST_DWithin geography). */
  async listNearby(params: { lat: number; lng: number; radiusKm: number; limit?: number }): Promise<NearbyFishery[]> {
    const meters = params.radiusKm * 1000;
    const point = sql`ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography`;
    const rows = await this.db.execute(sql`
      SELECT id, name, lat, lng, whatsapp, species,
             ST_Distance(geom::geography, ${point}) / 1000.0 AS distance_km
      FROM fisheries
      WHERE listing_active = true
        AND geom IS NOT NULL
        AND ST_DWithin(geom::geography, ${point}, ${meters})
      ORDER BY distance_km ASC
      LIMIT ${params.limit ?? 50}
    `);
    return rows.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        name: String(row.name),
        lat: Number(row.lat),
        lng: Number(row.lng),
        distanceKm: Number(row.distance_km),
        whatsapp: (row.whatsapp as string | null) ?? null,
        species: (row.species as string[] | null) ?? [],
      };
    });
  }
}
