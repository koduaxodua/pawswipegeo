import { supabase, ensureAnonAuth } from './supabase';

const BUCKET = 'pet-photos';

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * ატვირთავს ფოტოს Supabase Storage-ში და აბრუნებს public URL-ს.
 * იღებს base64 data URL-ს (AddDog form-ში მიღებულ კომპრესირებულ ფორმატს).
 */
export async function uploadPetPhoto(dataUrl: string): Promise<string> {
  if (!supabase) throw new Error('Supabase არ არის გაწყობილი');
  const userId = await ensureAnonAuth();
  if (!userId) throw new Error('ავტენტიფიკაცია ვერ მოხერხდა');

  const blob = await dataUrlToBlob(dataUrl);
  const ext = blob.type.split('/')[1] || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
