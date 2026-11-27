import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PhotoSource = 'camera' | 'library';
export type PhotoResult = { status: 'ok'; uri: string } | { status: 'cancelled' } | { status: 'denied' };

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

/**
 * Copia a foto do cache do picker para a pasta do app (o cache pode ser limpo pelo sistema).
 * Quando a API existir, aqui entra o upload para o storage (Supabase).
 */
function keep(uri: string): string {
  if (Platform.OS === 'web') return uri;
  const dir = new Directory(Paths.document, 'catches');
  if (!dir.exists) dir.create({ intermediates: true });
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = new File(dir, `${Date.now()}.${ext}`);
  new File(uri).copy(dest);
  return dest.uri;
}

/** Abre a câmera ou a galeria (Photo Picker do Android, sem permissão de armazenamento). */
export async function pickCatchPhoto(source: PhotoSource): Promise<PhotoResult> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { status: 'denied' };
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return { status: 'cancelled' };
  try {
    return { status: 'ok', uri: keep(asset.uri) };
  } catch {
    return { status: 'ok', uri: asset.uri };
  }
}
