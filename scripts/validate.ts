#!/usr/bin/env npx tsx

/**
 * NYKO Patterns Validation Script
 *
 * Validates pattern YAML files against the schema.
 * Run: npx tsx scripts/validate.ts [path-to-pattern.yaml]
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

interface PatternFile {
  id: string;
  version: string;
  updated_at: string;
  author: string;
  status: "stable" | "beta" | "deprecated";
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  time_estimate: string;
  stack: {
    required: Array<{ name: string; version: string; reason?: string }>;
    optional?: Array<{ name: string; version: string; reason?: string }>;
    incompatible?: Array<{ name: string; reason: string }>;
  };
  requires?: string[];
  enables?: string[];
  env_vars?: {
    required?: Array<{
      key: string;
      description: string;
      format?: string;
      where_to_find?: string;
    }>;
    optional?: Array<{
      key: string;
      description: string;
      default?: string;
    }>;
  };
  external_setup?: Array<{
    service: string;
    url?: string;
    steps: string[];
  }>;
  files: Array<{
    path: string;
    action: "create" | "modify" | "append";
    description: string;
    priority?: number;
  }>;
  code: Record<string, string>;
  edge_cases: Array<{
    id: string;
    symptom: string;
    cause: string;
    solution: string;
  }>;
  validation: {
    manual_test: string[];
    automated_test?: {
      command: string;
      expected: string;
    };
  };
}

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const VALID_CATEGORIES = [
  "auth",
  "payments",
  "database",
  "deploy",
  "email",
  "api",
  "storage",
  "monitoring",
  "ai",
];

const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const VALID_STATUSES = ["stable", "beta", "deprecated"];
const VALID_ACTIONS = ["create", "modify", "append"];

function validatePattern(pattern: PatternFile): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!pattern.id) {
    errors.push({ field: "id", message: "Missing required field", severity: "error" });
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pattern.id)) {
    errors.push({
      field: "id",
      message: "Must be kebab-case (e.g., my-pattern-name)",
      severity: "error",
    });
  }

  if (!pattern.version) {
    errors.push({ field: "version", message: "Missing required field", severity: "error" });
  } else if (!/^\d+\.\d+\.\d+$/.test(pattern.version)) {
    errors.push({
      field: "version",
      message: "Must be semantic version (e.g., 1.0.0)",
      severity: "error",
    });
  }

  if (!pattern.updated_at) {
    errors.push({ field: "updated_at", message: "Missing required field", severity: "error" });
  }

  if (!pattern.name) {
    errors.push({ field: "name", message: "Missing required field", severity: "error" });
  } else if (pattern.name.length > 100) {
    errors.push({
      field: "name",
      message: "Name should be less than 100 characters",
      severity: "warning",
    });
  }

  if (!pattern.description) {
    errors.push({ field: "description", message: "Missing required field", severity: "error" });
  } else if (pattern.description.length > 500) {
    errors.push({
      field: "description",
      message: "Description should be less than 500 characters",
      severity: "warning",
    });
  }

  if (!pattern.category) {
    errors.push({ field: "category", message: "Missing required field", severity: "error" });
  } else if (!VALID_CATEGORIES.includes(pattern.category)) {
    errors.push({
      field: "category",
      message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      severity: "error",
    });
  }

  if (!pattern.tags || pattern.tags.length < 2) {
    errors.push({
      field: "tags",
      message: "At least 2 tags are required",
      severity: "error",
    });
  }

  if (!pattern.difficulty) {
    errors.push({ field: "difficulty", message: "Missing required field", severity: "error" });
  } else if (!VALID_DIFFICULTIES.includes(pattern.difficulty)) {
    errors.push({
      field: "difficulty",
      message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(", ")}`,
      severity: "error",
    });
  }

  if (pattern.status && !VALID_STATUSES.includes(pattern.status)) {
    errors.push({
      field: "status",
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      severity: "error",
    });
  }

  // Stack validation
  if (!pattern.stack?.required || pattern.stack.required.length === 0) {
    errors.push({
      field: "stack.required",
      message: "At least one required dependency must be specified",
      severity: "error",
    });
  }

  // Files validation
  if (!pattern.files || pattern.files.length === 0) {
    errors.push({
      field: "files",
      message: "At least one file must be specified",
      severity: "error",
    });
  } else {
    pattern.files.forEach((file, index) => {
      if (!file.path) {
        errors.push({
          field: `files[${index}].path`,
          message: "File path is required",
          severity: "error",
        });
      }
      if (!file.action || !VALID_ACTIONS.includes(file.action)) {
        errors.push({
          field: `files[${index}].action`,
          message: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`,
          severity: "error",
        });
      }
    });
  }

  // Code validation
  if (!pattern.code || Object.keys(pattern.code).length === 0) {
    errors.push({
      field: "code",
      message: "Code content is required",
      severity: "error",
    });
  } else {
    // Check that all files have corresponding code
    const codeFiles = Object.keys(pattern.code);
    pattern.files?.forEach((file) => {
      if (file.action === "create" && !codeFiles.includes(file.path)) {
        errors.push({
          field: `code.${file.path}`,
          message: `Missing code for file: ${file.path}`,
          severity: "error",
        });
      }
    });
  }

  // Edge cases validation
  if (!pattern.edge_cases || pattern.edge_cases.length < 3) {
    errors.push({
      field: "edge_cases",
      message: "At least 3 edge cases are required",
      severity: "error",
    });
  }

  // Validation section
  if (!pattern.validation?.manual_test || pattern.validation.manual_test.length === 0) {
    errors.push({
      field: "validation.manual_test",
      message: "At least one manual test step is required",
      severity: "error",
    });
  }

  return errors;
}

function validateFile(filePath: string): { valid: boolean; errors: ValidationError[] } {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const pattern = yaml.parse(content) as PatternFile;
    const errors = validatePattern(pattern);

    return {
      valid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          field: "file",
          message: `Failed to parse YAML: ${error instanceof Error ? error.message : "Unknown error"}`,
          severity: "error",
        },
      ],
    };
  }
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

// Main execution
const args = process.argv.slice(2);
const patternsDir = path.join(process.cwd(), "patterns");

let filesToValidate: string[];

if (args.length > 0) {
  // Validate specific file
  filesToValidate = args.map((arg) =>
    path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg)
  );
} else {
  // Validate all patterns
  filesToValidate = findPatternFiles(patternsDir);
}

console.log(`\n🔍 Validating ${filesToValidate.length} pattern(s)...\n`);

let hasErrors = false;
let totalErrors = 0;
let totalWarnings = 0;

for (const file of filesToValidate) {
  const relativePath = path.relative(process.cwd(), file);
  const { valid, errors } = validateFile(file);

  const fileErrors = errors.filter((e) => e.severity === "error");
  const fileWarnings = errors.filter((e) => e.severity === "warning");

  totalErrors += fileErrors.length;
  totalWarnings += fileWarnings.length;

  if (!valid || fileWarnings.length > 0) {
    console.log(`📄 ${relativePath}`);

    for (const error of errors) {
      const icon = error.severity === "error" ? "❌" : "⚠️";
      console.log(`   ${icon} ${error.field}: ${error.message}`);
    }

    console.log("");
  }

  if (!valid) {
    hasErrors = true;
  }
}

// Summary
console.log("─".repeat(50));
console.log(`\n📊 Validation Summary:`);
console.log(`   Files checked: ${filesToValidate.length}`);
console.log(`   Errors: ${totalErrors}`);
console.log(`   Warnings: ${totalWarnings}`);

if (hasErrors) {
  console.log(`\n❌ Validation failed with ${totalErrors} error(s)\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All patterns are valid!\n`);
  process.exit(0);
}
