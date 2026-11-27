import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'camera' | 'library';
export type PhotoResult = { status: 'ok'; uri: string } | { status: 'cancelled' } | { status: 'denied' };

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  // Foto comprimida: sobe rápido no 4G e cabe no limite de 5 MB do Storage.
  quality: 0.7,
};

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
  return { status: 'ok', uri: asset.uri };
}
