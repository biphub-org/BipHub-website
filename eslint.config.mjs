import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // PITFALLS Pitfall 7: prevent service-role client from leaking outside (admin)/**.
    // Applies to ALL files except the admin route group + the admin factory file itself.
    ignores: ["app/(admin)/**", "lib/supabase/admin.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/admin",
              message:
                "createAdminClient bypasses RLS. Import only from app/(admin)/** or lib/supabase/admin.ts. See CLAUDE.md never-do list and PITFALLS Pitfall 7.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
