import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const pathPrefix = formData.get('pathPrefix') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique file name
    const timestamp = Date.now();
    const filename = `${pathPrefix}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Ensure the bucket exists (krsvr-images)
    const bucketName = 'krsvr-images';

    // Upload the file to Supabase using the service role to bypass RLS restrictions
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      // If the bucket doesn't exist, we could try to create it here too, but normally you'd handle that beforehand.
      console.error('Supabase upload error:', error);
      
      // Attempt to create bucket if it doesn't exist just in case
      if (error.message.includes('Bucket not found')) {
        await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        // Retry upload
        const retry = await supabaseAdmin.storage.from(bucketName).upload(filename, buffer, {
          contentType: file.type,
          upsert: true
        });
        if (retry.error) {
           throw retry.error;
        }
      } else {
        throw error;
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
