import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE policyname = 'Public Insert Access'
          AND tablename = 'objects'
          AND schemaname = 'storage'
      ) THEN
          EXECUTE 'CREATE POLICY "Public Insert Access" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = ''krsvr-images'')';
      END IF;

      IF NOT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE policyname = 'Public Update Access'
          AND tablename = 'objects'
          AND schemaname = 'storage'
      ) THEN
          EXECUTE 'CREATE POLICY "Public Update Access" ON storage.objects FOR UPDATE TO public USING (bucket_id = ''krsvr-images'')';
      END IF;

      IF NOT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE policyname = 'Public Delete Access'
          AND tablename = 'objects'
          AND schemaname = 'storage'
      ) THEN
          EXECUTE 'CREATE POLICY "Public Delete Access" ON storage.objects FOR DELETE TO public USING (bucket_id = ''krsvr-images'')';
      END IF;
    END
    $$;
  `);

  console.log("Policies applied for full public access to bucket krsvr-images.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
