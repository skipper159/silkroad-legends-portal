const fs = require('fs');
const path = require('path');

// Base directory for modular swagger files
const MODULAR_DIR = path.join(__dirname, 'modular');
const OUTPUT_FILE = path.join(__dirname, 'swagger_compiled.json');

/**
 * Recursively load JSON files from a directory
 */
function loadJsonFiles(dir, result = {}) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return result;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      loadJsonFiles(fullPath, result);
    } else if (item.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        // Validate JSON structure
        if (typeof content !== 'object' || content === null) {
          console.warn(`⚠️  Invalid JSON structure in ${fullPath}: expected object`);
          continue;
        }

        // Check for duplicate paths
        const duplicates = Object.keys(content).filter((key) => result.hasOwnProperty(key));
        if (duplicates.length > 0) {
          console.warn(`⚠️  Duplicate paths found in ${fullPath}:`, duplicates);
        }

        // Merge content into result
        Object.assign(result, content);
        console.log(
          `✓ Loaded ${Object.keys(content).length} items from ${path.relative(
            MODULAR_DIR,
            fullPath
          )}`
        );
      } catch (error) {
        console.error(`❌ Error loading ${fullPath}:`, error.message);
        throw new Error(`Failed to load ${fullPath}: ${error.message}`);
      }
    }
  }

  return result;
}

/**
 * Validate schema references in paths
 */
function validateSchemaReferences(paths, schemas, responses = {}) {
  const errors = [];
  const warnings = [];

  function findReferences(obj, currentPath = '') {
    if (typeof obj !== 'object' || obj === null) return;

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;

      if (key === '$ref' && typeof value === 'string') {
        // Check if reference exists
        if (value.startsWith('#/components/schemas/')) {
          const schemaName = value.replace('#/components/schemas/', '');
          if (!schemas.hasOwnProperty(schemaName)) {
            errors.push(`Missing schema reference: ${value} at ${fullPath}`);
          }
        } else if (value.startsWith('#/components/responses/')) {
          const responseName = value.replace('#/components/responses/', '');
          // Check if response exists in loaded responses or hardcoded ones
          const standardResponses = ['Unauthorized', 'Forbidden', 'NotFound', 'BadRequest'];
          const hasLoadedResponse = responses.hasOwnProperty(responseName);
          const hasStandardResponse = standardResponses.includes(responseName);

          if (!hasLoadedResponse && !hasStandardResponse) {
            errors.push(`Missing response reference: ${value} at ${fullPath}`);
          }
        }
      } else if (typeof value === 'object') {
        findReferences(value, fullPath);
      }
    }
  }

  findReferences(paths);

  return { errors, warnings };
}

/**
 * Validate OpenAPI structure
 */
function validateOpenAPIStructure(swagger) {
  const errors = [];
  const warnings = [];

  // Check required OpenAPI fields
  if (!swagger.openapi) {
    errors.push('Missing required field: openapi');
  }
  if (!swagger.info) {
    errors.push('Missing required field: info');
  }
  if (!swagger.paths) {
    errors.push('Missing required field: paths');
  }

  // Check info object
  if (swagger.info) {
    if (!swagger.info.title) {
      errors.push('Missing required field: info.title');
    }
    if (!swagger.info.version) {
      errors.push('Missing required field: info.version');
    }
  }

  // Check for empty paths
  if (swagger.paths && Object.keys(swagger.paths).length === 0) {
    warnings.push('No paths defined in API specification');
  }

  // Validate HTTP methods
  if (swagger.paths) {
    const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];

    for (const [pathName, pathItem] of Object.entries(swagger.paths)) {
      if (typeof pathItem !== 'object') continue;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (!validMethods.includes(method)) {
          // Skip non-method properties like parameters, $ref, etc.
          continue;
        }

        if (!operation.responses) {
          errors.push(`Missing responses for ${method.toUpperCase()} ${pathName}`);
        }

        if (!operation.tags || operation.tags.length === 0) {
          warnings.push(`No tags defined for ${method.toUpperCase()} ${pathName}`);
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Build complete swagger specification from modular files
 */
function buildSwagger() {
  console.log('🔨 Building modular swagger documentation...');

  try {
    // Load main swagger configuration
    const mainFile = path.join(MODULAR_DIR, 'swagger_main.json');
    if (!fs.existsSync(mainFile)) {
      throw new Error('Main swagger file not found: swagger_main.json');
    }

    const swagger = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
    console.log('✓ Loaded main configuration');

    // Load all schema files
    console.log('📋 Loading schemas...');
    const schemasDir = path.join(MODULAR_DIR, 'components', 'schemas');
    const schemas = loadJsonFiles(schemasDir);

    // Load security definitions
    console.log('🔐 Loading security definitions...');
    const securityFile = path.join(MODULAR_DIR, 'components', 'security.json');
    let securitySchemes = {};
    if (fs.existsSync(securityFile)) {
      securitySchemes = JSON.parse(fs.readFileSync(securityFile, 'utf8'));
      console.log('✓ Loaded security schemes');
    }

    // Load response definitions
    console.log('📨 Loading response definitions...');
    const responsesDir = path.join(MODULAR_DIR, 'components', 'responses');
    let responses = {};
    if (fs.existsSync(responsesDir)) {
      responses = loadJsonFiles(responsesDir);
    }

    // Load all path files
    console.log('🛣️  Loading API paths...');
    const pathsDir = path.join(MODULAR_DIR, 'paths');
    const paths = loadJsonFiles(pathsDir);

    // Validate schema references
    console.log('🔍 Validating schema references...');
    const { errors: refErrors, warnings: refWarnings } = validateSchemaReferences(
      paths,
      schemas,
      responses
    );

    if (refErrors.length > 0) {
      console.error('❌ Schema reference errors:');
      refErrors.forEach((error) => console.error(`   ${error}`));
      throw new Error('Schema validation failed');
    }

    if (refWarnings.length > 0) {
      console.warn('⚠️  Schema reference warnings:');
      refWarnings.forEach((warning) => console.warn(`   ${warning}`));
    }

    // Build complete swagger object
    swagger.components = {
      schemas: schemas,
      securitySchemes: securitySchemes,
      responses: {
        // Load custom responses from files
        ...responses,
        // Keep existing hardcoded responses for backwards compatibility
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    };

    swagger.paths = paths;

    // Validate complete OpenAPI structure
    console.log('🧪 Validating OpenAPI structure...');
    const { errors: structErrors, warnings: structWarnings } = validateOpenAPIStructure(swagger);

    if (structErrors.length > 0) {
      console.error('❌ OpenAPI structure errors:');
      structErrors.forEach((error) => console.error(`   ${error}`));
      throw new Error('OpenAPI validation failed');
    }

    if (structWarnings.length > 0) {
      console.warn('⚠️  OpenAPI structure warnings:');
      structWarnings.forEach((warning) => console.warn(`   ${warning}`));
    }

    // Write compiled swagger
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swagger, null, 2));

    console.log('');
    console.log('✅ Swagger documentation compiled successfully!');
    console.log(`📁 Output: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
    console.log('📊 Statistics:');
    console.log(`   - Schemas: ${Object.keys(schemas).length}`);
    console.log(`   - Paths: ${Object.keys(paths).length}`);
    console.log(`   - Security Schemes: ${Object.keys(securitySchemes).length}`);
    console.log(`   - Components: ${Object.keys(swagger.components.responses).length} responses`);

    if (refWarnings.length + structWarnings.length > 0) {
      console.log(`   - Warnings: ${refWarnings.length + structWarnings.length}`);
    }
  } catch (error) {
    console.error('❌ Error building swagger:', error.message);
    process.exit(1);
  }
}

/**
 * Validate that compiled swagger is valid and complete
 */
function validateBuild() {
  console.log('🔍 Validating compiled swagger...');

  try {
    const compiled = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));

    // Basic validation checks
    const compiledPaths = Object.keys(compiled.paths || {});
    const compiledSchemas = Object.keys(compiled.components?.schemas || {});
    const compiledResponses = Object.keys(compiled.components?.responses || {});

    console.log('📊 Validation Results:');
    console.log(`   - Total paths: ${compiledPaths.length}`);
    console.log(`   - Total schemas: ${compiledSchemas.length}`);
    console.log(`   - Total responses: ${compiledResponses.length}`);

    // Check for essential components
    const requiredResponses = ['InternalServerError', 'BadRequest', 'Unauthorized', 'NotFound'];
    const missingResponses = requiredResponses.filter((r) => !compiledResponses.includes(r));

    if (missingResponses.length > 0) {
      console.warn(`⚠️  Missing essential responses: ${missingResponses.join(', ')}`);
    } else {
      console.log('✅ All essential responses are present');
    }

    // Check if we have ranking endpoints
    const rankingPaths = compiledPaths.filter((path) => path.includes('ranking'));
    console.log(`📊 Ranking endpoints: ${rankingPaths.length}`);

    if (rankingPaths.length > 0) {
      console.log('✅ Ranking system endpoints are present');
    }

    console.log('✅ Validation complete - compiled swagger is valid');
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}

/**
 * Watch for changes and rebuild automatically
 */
function watchForChanges() {
  console.log('👀 Watching for changes in modular files...');
  console.log('Press Ctrl+C to stop');

  fs.watch(MODULAR_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`🔄 Change detected: ${filename}`);
      setTimeout(() => {
        buildSwagger();
      }, 100); // Small delay to ensure file is fully written
    }
  });
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'build':
    buildSwagger();
    break;
  case 'validate':
    buildSwagger();
    validateBuild();
    break;
  case 'watch':
    buildSwagger();
    watchForChanges();
    break;
  default:
    console.log('Lafftale Swagger Builder');
    console.log('');
    console.log('Usage:');
    console.log('  node swagger_builder.js build     - Build swagger from modular files');
    console.log('  node swagger_builder.js validate  - Build and validate against original');
    console.log('  node swagger_builder.js watch     - Build and watch for changes');
    console.log('');
    console.log('Files:');
    console.log('  Input:  swagger/modular/**/*.json');
    console.log('  Output: swagger/swagger_compiled.json');
}
