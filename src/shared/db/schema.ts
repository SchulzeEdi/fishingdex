import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Schema do fishingdex (B2C, sem tenant_id — ADR-0005). Locais usam lat/lng + coluna
// PostGIS `geom` criada por SQL na migration (ADR-0007), fora do controle de tipos do Drizzle.

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  country: text('country'),
  plan: text('plan').notNull().default('free'), // free | pro
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fishSpecies = pgTable('fish_species', {
  id: text('id').primaryKey(),
  namePt: text('name_pt').notNull(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
  scientificName: text('scientific_name').notNull(),
  habitat: text('habitat').notNull(), // freshwater | saltwater
  rarity: text('rarity').notNull(),
  regions: text('regions').array().notNull(), // ['BR','AR','US']
  maxPlausibleSizeCm: integer('max_plausible_size_cm').notNull(),
  maxPlausibleWeightKg: real('max_plausible_weight_kg'),
});

export const catches = pgTable(
  'catches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    speciesId: text('species_id')
      .notNull()
      .references(() => fishSpecies.id),
    photoUrl: text('photo_url'),
    sizeCm: real('size_cm').notNull(),
    weightKg: real('weight_kg'),
    caughtAt: timestamp('caught_at', { withTimezone: true }).notNull().defaultNow(),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    isPrivate: boolean('is_private').notNull().default(false),
    bait: text('bait'),
    rod: text('rod'),
    reel: text('reel'),
    line: text('line'),
  },
  (t) => ({
    byUser: index('catches_user_idx').on(t.userId),
    bySpecies: index('catches_species_idx').on(t.speciesId),
    bySize: index('catches_size_idx').on(t.sizeCm),
  }),
);

export const dexUnlocks = pgTable(
  'dex_unlocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    speciesId: text('species_id')
      .notNull()
      .references(() => fishSpecies.id),
    firstCatchId: uuid('first_catch_id').references(() => catches.id, { onDelete: 'set null' }),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqUserSpecies: uniqueIndex('dex_user_species_uniq').on(t.userId, t.speciesId),
  }),
);

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followeeId: uuid('followee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followeeId] }),
    byFollower: index('follows_follower_idx').on(t.followerId),
  }),
);

export const likes = pgTable(
  'likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    catchId: uuid('catch_id')
      .notNull()
      .references(() => catches.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.catchId] }),
    byCatch: index('likes_catch_idx').on(t.catchId),
  }),
);

export const fisheries = pgTable('fisheries', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  species: text('species').array().notNull().default(sql`'{}'`),
  photos: text('photos').array().notNull().default(sql`'{}'`),
  whatsapp: text('whatsapp'),
  description: text('description'),
  listingActive: boolean('listing_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull(), // pro | fishery_listing
  provider: text('provider').notNull(), // iap | stripe
  status: text('status').notNull(), // active | canceled | past_due
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
});

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: uuid('reporter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    catchId: uuid('catch_id')
      .notNull()
      .references(() => catches.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byCatch: index('reports_catch_idx').on(t.catchId),
  }),
);
