import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { catchActions, insertCatch, type Catch, type NewCatch } from '@/entities/catch';
import { sessionStore } from '@/entities/user';
import { AppError, getSupabase, toAppError } from '@/shared/api';
import { createId } from '@/shared/lib';

const BUCKET = 'catch-photos';

function contentTypeOf(uri: string): string {
  const ext = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}

async function readBytes(uri: string): Promise<ArrayBuffer | Blob> {
  if (Platform.OS === 'web') return (await fetch(uri)).blob();
  return new File(uri).arrayBuffer();
}

/** Envia a foto para o Storage (pasta do usuário) e devolve a URL pública. */
export async function uploadCatchPhoto(localUri: string): Promise<string> {
  const uid = sessionStore.getState().profile?.id;
  if (!uid) throw new AppError('not_authenticated');
  const type = contentTypeOf(localUri);
  const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
  const path = `${uid}/${createId('p')}.${ext}`;
  const bucket = getSupabase().storage.from(BUCKET);
  try {
    const { error } = await bucket.upload(path, await readBytes(localUri), { contentType: type, upsert: false });
    if (error) throw error;
  } catch (e) {
    throw toAppError(e);
  }
  return bucket.getPublicUrl(path).data.publicUrl;
}

/** Registra no servidor (foto antes, se houver) e já coloca no diário local. */
export async function registerCatch(input: Omit<NewCatch, 'photoUrl'> & { photoUri?: string | null }): Promise<Catch> {
  const photoUrl = input.photoUri ? await uploadCatchPhoto(input.photoUri) : null;
  const created = await insertCatch({ ...input, photoUrl });
  catchActions.add(created);
  return created;
}
