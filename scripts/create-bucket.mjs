import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const bucketName = "documents";

const { data: existing } = await supabase.storage.getBucket(bucketName);
if (existing) {
  console.log(`Bucket "${bucketName}" already exists.`);
} else {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 26214400, // 25 MB
    allowedMimeTypes: ["application/pdf"],
  });
  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }
  console.log(`Bucket "${bucketName}" created (private).`);
}
