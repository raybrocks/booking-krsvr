import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const bucketName = 'krsvr-images';

async function uploadToSupabase(url: string, pathPrefix: string): Promise<string | null> {
  if (!url || (!url.includes('firebasestorage') && !url.includes('storage.googleapis.com'))) {
    // Return the original URL if it's already somehow a correct URL
    return url;
  }

  console.log(`Downloading: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.statusText}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Extract a basic filename, or generate one
    const extMatch = contentType.match(/\/(jpg|jpeg|png|gif|webp|svg)/i);
    const ext = extMatch ? `.${extMatch[1]}` : '.jpg';
    
    const filename = `${pathPrefix}/migrated_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;

    console.log(`Uploading to Supabase: ${filename}`);
    
    // Ensure the bucket exists (this will fail silently if it does exist)
    const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.warn(`Warning creating bucket ${bucketName}:`, bucketError);
    }

    const { data, error } = await supabaseAdmin.storage.from(bucketName).upload(filename, buffer, {
      contentType: contentType,
      upsert: true
    });

    if (error) {
      console.error(`Error uploading ${filename}:`, error);
      return null;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filename);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error(`Exception processing ${url}:`, error);
    return null;
  }
}

async function migrate() {
  console.log("Starting Migration...");

  // 1. Migrate Experiences
  const experiences = await prisma.experience.findMany();
  console.log(`Found ${experiences.length} experiences to check.`);
  
  for (const exp of experiences) {
    if (exp.picture && exp.picture.includes('firebase')) {
      const newUrl = await uploadToSupabase(exp.picture, 'experiences');
      if (newUrl && newUrl !== exp.picture) {
        await prisma.experience.update({
          where: { id: exp.id },
          data: { picture: newUrl }
        });
        console.log(`Updated experience ${exp.name} with new URL.`);
      }
    }
  }

  // 2. Migrate Testimonials
  const testimonials = await prisma.testimonial.findMany();
  console.log(`Found ${testimonials.length} testimonials to check.`);
  
  for (const testi of testimonials) {
    let mainUpdated = false;
    let logoUpdated = false;
    let newMainUrl = testi.mainImage;
    let newLogoUrl = testi.logoImage;

    if (testi.mainImage && testi.mainImage.includes('firebase')) {
      const url = await uploadToSupabase(testi.mainImage, 'testimonials');
      if (url) {
        newMainUrl = url;
        mainUpdated = true;
      }
    }

    if (testi.logoImage && testi.logoImage.includes('firebase')) {
      const url = await uploadToSupabase(testi.logoImage, 'testimonials');
      if (url) {
        newLogoUrl = url;
        logoUpdated = true;
      }
    }

    if (mainUpdated || logoUpdated) {
      await prisma.testimonial.update({
        where: { id: testi.id },
        data: { mainImage: newMainUrl, logoImage: newLogoUrl }
      });
      console.log(`Updated testimonial ${testi.companyName} with new URLs.`);
    }
  }

  console.log("Migration finished.");
}

migrate()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
