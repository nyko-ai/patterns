#!/usr/bin/env npx tsx

/**
 * NYKO Patterns Database Sync Script
 *
 * Syncs pattern YAML files to a database (Supabase, PostgreSQL, etc.)
 * for use with MCP servers and API queries.
 *
 * Run: npx tsx scripts/sync-db.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

interface Pattern {
  id: string;
  version: string;
  updated_at: string;
  author: string;
  status: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: string;
  time_estimate: string;
  stack: object;
  requires: string[];
  enables: string[];
  env_vars: object;
  external_setup: object[];
  files: object[];
  code: Record<string, string>;
  edge_cases: object[];
  validation: object;
}

interface Category {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  recommended_order?: string[];
}

function findPatternFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".yaml") &&
        !entry.name.startsWith("_")
      ) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function findCategoryFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === "_category.yaml") {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function loadPatterns(dir: string): Pattern[] {
  const files = findPatternFiles(dir);
  const patterns: Pattern[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const pattern = yaml.parse(content) as Pattern;
      patterns.push(pattern);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return patterns;
}

function loadCategories(dir: string): Category[] {
  const files = findCategoryFiles(dir);
  const categories: Category[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const category = yaml.parse(content) as Category;
      categories.push(category);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return categories;
}

async function syncToSupabase(patterns: Pattern[], categories: Category[]) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️  Supabase credentials not found. Skipping database sync.");
    console.log("   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.");
    return;
  }

  // Dynamic import to avoid requiring the package if not syncing
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("📤 Syncing to Supabase...");

  // Upsert categories
  for (const category of categories) {
    const { error } = await supabase
      .from("pattern_categories")
      .upsert(
        {
          id: category.id,
          name: category.name,
          description: category.description,
          pattern_ids: category.patterns,
          recommended_order: category.recommended_order,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error(`❌ Error upserting category ${category.id}:`, error.message);
    }
  }

  // Upsert patterns
  for (const pattern of patterns) {
    const { error } = await supabase
      .from("patterns")
      .upsert(
        {
          id: pattern.id,
          version: pattern.version,
          updated_at: pattern.updated_at,
          author: pattern.author,
          status: pattern.status,
          name: pattern.name,
          description: pattern.description,
          category: pattern.category,
          tags: pattern.tags,
          difficulty: pattern.difficulty,
          time_estimate: pattern.time_estimate,
          stack: pattern.stack,
          requires: pattern.requires || [],
          enables: pattern.enables || [],
          env_vars: pattern.env_vars || {},
          external_setup: pattern.external_setup || [],
          files: pattern.files,
          code: pattern.code,
          edge_cases: pattern.edge_cases,
          validation: pattern.validation,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error(`❌ Error upserting pattern ${pattern.id}:`, error.message);
    } else {
      console.log(`   ✅ ${pattern.id}`);
    }
  }

  console.log("✅ Supabase sync complete!");
}

function generateJsonExport(patterns: Pattern[], categories: Category[], outputDir: string) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export patterns index
  const patternsIndex = patterns.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    tags: p.tags,
    difficulty: p.difficulty,
    status: p.status,
    version: p.version,
  }));

  fs.writeFileSync(
    path.join(outputDir, "patterns-index.json"),
    JSON.stringify(patternsIndex, null, 2)
  );

  // Export full patterns
  fs.writeFileSync(
    path.join(outputDir, "patterns.json"),
    JSON.stringify(patterns, null, 2)
  );

  // Export categories
  fs.writeFileSync(
    path.join(outputDir, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  // Export individual pattern files
  const patternsOutputDir = path.join(outputDir, "patterns");
  if (!fs.existsSync(patternsOutputDir)) {
    fs.mkdirSync(patternsOutputDir, { recursive: true });
  }

  for (const pattern of patterns) {
    fs.writeFileSync(
      path.join(patternsOutputDir, `${pattern.id}.json`),
      JSON.stringify(pattern, null, 2)
    );
  }

  console.log(`✅ JSON export complete: ${outputDir}`);
}

// Main execution
async function main() {
  const patternsDir = path.join(process.cwd(), "patterns");
  const outputDir = path.join(process.cwd(), "dist");

  console.log("\n🔄 NYKO Patterns Sync\n");

  // Load patterns and categories
  const patterns = loadPatterns(patternsDir);
  const categories = loadCategories(patternsDir);

  console.log(`📦 Loaded ${patterns.length} patterns`);
  console.log(`📂 Loaded ${categories.length} categories\n`);

  // Generate JSON export
  console.log("📝 Generating JSON export...");
  generateJsonExport(patterns, categories, outputDir);

  // Sync to Supabase if credentials are available
  await syncToSupabase(patterns, categories);

  console.log("\n✨ Sync complete!\n");
}

main().catch(console.error);
