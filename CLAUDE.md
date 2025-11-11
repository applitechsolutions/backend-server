# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Xelatrucks Backend** - Node.js/Express REST API for transportation and logistics management system serving La Viña S.A. The application manages three core business domains:

1. **Centro de Distribución (Distribution Center)** - Customer sales, inventory, and warehouse management
2. **Viajes (Trips/Transportation)** - Fleet management, trip tracking, and billing for three trip types (green/material, white/cargo, tank/liquid)
3. **Taller (Workshop)** - Vehicle maintenance, spare parts inventory, and repair tracking

**Tech Stack:** Express.js, Mongoose (MongoDB/CosmosDB), JWT authentication, bcryptjs, nodemon

## Development Commands

### Running the Server
```bash
npm start              # Start with nodemon (hot reload)
```

The server runs on port 3000 by default (or `process.env.PORT` if set).

### Database
Local development can use MongoDB via Docker:
```bash
docker-compose up -d   # Start MongoDB container on port 27017
```

Production uses Azure CosmosDB via environment variable `CUSTOMCONNSTR_COSMOS_CONNSTR`.

### Build (Legacy)
```bash
npm run build          # Babel transpilation (rarely used)
```

## Architecture

### Project Structure
```
├── app.js                 # Express app, DB connection, route mounting
├── config/config.js       # JWT seed, Google OAuth credentials
├── models/               # 40+ Mongoose schemas
├── routes/               # 42+ Express route handlers (CRUD + reports)
├── middlewares/auth.js   # JWT verification and role-based auth
├── uploads/              # File storage (images)
└── docker-compose.yml    # Local MongoDB setup
```

### Model-Route Pattern

**Models** follow consistent structure:
- Use `state: Boolean` for soft deletes (`false` = active, `true` = deleted)
- ObjectId references with `ref` property for relationships
- Float fields use `mongoose-float` with 2 decimal precision
- Embedded documents for nested one-to-many data (e.g., `vehicle.pits[]`)
- Enums for controlled vocabulary fields

**Routes** follow standard CRUD pattern:
- `GET /` - List all (always filter `state: false`)
- `GET /:id` - Get single entity (with `.populate()` for relationships)
- `POST /` - Create (requires `mdAuth.verificaToken`)
- `PUT /:id` - Update (requires auth)
- `PUT /delete/:id` - Soft delete: set `state: true` (requires auth)

Complex routes add report endpoints using MongoDB aggregation pipeline with `$lookup`, `$unwind`, `$group`.

### Authentication & Authorization

**Token-based auth with JWT:**
- Tokens passed as query parameter: `?token=xyz`
- Two middlewares in `middlewares/auth.js`:
  - `verificaToken` - Validates JWT, adds `req.usuario`
  - `verificaADMIN_ROLE` - Checks for admin role
- JWT includes full user object, expires in 4 hours
- Passwords hashed with bcryptjs (10 rounds)
- Google OAuth2 integration available in login route

**User roles:** `ADMIN_ROLE` and `USER_ROLE`

### Response Format

All endpoints use standardized JSON responses:
```javascript
// Success
{ ok: true, data: {...} }

// Error
{ ok: false, mensaje: 'User message', errors: {...} }
```

**Status codes:**
- `200/201` - Success
- `400` - Bad request/validation error
- `401` - Authentication error
- `500` - Server error

### Database Patterns

**Soft Deletes:**
Always filter by `state: false` in queries. Never hard delete records:
```javascript
Entity.find({ state: false }).exec(callback);
Entity.findByIdAndUpdate(id, { $set: { state: true } }, { new: true });
```

**Relationships:**
- Use `.populate('_reference', 'field1 field2')` to include related data
- Nested populates: `.populate('nested._field')`
- Aggregation with `$lookup` for complex joins

**Queries:**
- Older routes use callback style with `.exec(callback)`
- Newer routes use promises with `.then().catch()`
- Login route uses async/await

### Route Mounting

Routes organized by domain in `app.js`:

**Admin:**
- `/usuario` - Users
- `/login` - Authentication (with token renewal)
- `/area` - Business areas
- `/userArea` - User-area assignments

**Distribution Center:**
- `/cliente` - Customers
- `/material` - Materials/products
- `/materialCellar` - Warehouse locations
- `/ventas` - Sales
- `/comprasCD` - Purchases
- `/excesos` - Missing/surplus inventory
- `/cajaTiposCD`, `/cajaCD` - Cash register

**Transportation (3 trip types):**
- Green trips (material/cuadros): `/viajeV`, `/facturaV`
- White trips (cargo): `/viajeB`, `/facturaB`
- Tank trips (liquid): `/viajeA`, `/facturaA`, `/destinoA`
- Supporting: `/empleado`, `/tviajes`, `/CPcliente`, `/destino`, `/order`, `/pull`

**Workshop:**
- `/vehiculo` - Vehicles (with embedded pit/tire records)
- `/gondola` - Trailers
- `/mantenimiento` - Maintenance records
- `/tipoMantenimiento` - Maintenance types
- `/mecanico` - Mechanics
- `/repuesto` - Auto parts
- `/compraRepuesto` - Part purchases
- `/autoProveedor` - Parts suppliers
- `/marca` - Vehicle makes
- `/llanta` - Tires/rims
- `/pit` - Service bays

**Utilities:**
- `/search` - Global search across collections
- `/upload` - File uploads (images)
- `/img` - Image serving

## Adding New Features

### Creating a New Entity Type

**1. Create Model** (`models/newEntity.js`):
```javascript
var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);
var Schema = mongoose.Schema;

var newEntitySchema = new Schema({
  _reference: { type: Schema.Types.ObjectId, ref: 'RefModel' },
  name: { type: String, required: [true, 'Name required'] },
  amount: { type: Float },
  state: { type: Boolean, default: false }
});

module.exports = mongoose.model('NewEntity', newEntitySchema);
```

**2. Create Routes** (`routes/newEntity.js`):
- Use `routes/employee.js` or `routes/customer.js` as template
- Implement all 5 standard endpoints (GET all, GET one, POST, PUT, PUT delete)
- Apply `mdAuth.verificaToken` to POST/PUT/DELETE operations
- Always filter `state: false` in GET operations
- Use `.populate()` for referenced fields

**3. Register in app.js:**
```javascript
var newEntityRoutes = require('./routes/newEntity');
app.use('/newRoute', newEntityRoutes);
```

### Adding Report Endpoints

Use MongoDB aggregation pipeline for complex queries:
```javascript
app.get('/report', (req, res) => {
  var fecha1 = req.query.fecha1;  // Date range support
  var fecha2 = req.query.fecha2;

  Entity.aggregate([
    { $match: { state: false, date: { $gte: fecha1, $lte: fecha2 } } },
    { $lookup: {
        from: 'relatedcollection',
        localField: '_reference',
        foreignField: '_id',
        as: 'joined'
    }},
    { $unwind: '$joined' },
    { $group: { _id: '$groupField', total: { $sum: '$amount' } } }
  ], (err, results) => {
    if (err) return res.status(400).json({ ok: false, ... });
    res.status(200).json({ ok: true, data: results });
  });
});
```

### Adding Relationships

**One-to-Many (separate collection):**
```javascript
// In model
_reference: { type: Schema.Types.ObjectId, ref: 'OtherModel' }

// In route
Entity.find().populate('_reference', 'field1 field2').exec(callback);
```

**One-to-Many (embedded):**
```javascript
// In model
details: [{
  _item: { type: Schema.Types.ObjectId, ref: 'Item' },
  quantity: { type: Float },
  price: { type: Float }
}]

// In route
Entity.find().populate('details._item').exec(callback);
```

## Key Business Logic

### Trip Types and Billing
Three distinct trip workflows with separate models for trips and bills:

1. **Green Trips (viajeV/facturaV)** - Transport "cuadros" (material squares) from pits to destinations
2. **White Trips (viajeB/facturaB)** - General cargo transport
3. **Tank Trips (viajeA/facturaA)** - Liquid transport in tank vehicles

Each has dedicated trip, bill, and destination models. Bills contain nested details with references to customers and line items.

### Vehicle Management
Vehicle model includes:
- Basic info (placa/license plate, marca/make, tipo/type)
- Embedded `pits[]` array for tire tracking with date and mileage
- Embedded `gasolina[]` array for fuel records
- Soft delete via `state` field

Vehicle maintenance tracked separately in `maintenance` model, which can reference either a vehicle or gondola.

### Inventory Systems
Two separate inventory systems:
1. **Material/MaterialCellar** - Distribution center inventory
2. **AutoPart** - Workshop spare parts inventory

Both use soft deletes and support purchase/usage tracking.

## File Uploads

Upload endpoint: `PUT /upload/:tipo/:id`

**Supported collections:** Currently only `usuarios` (users)

**Process:**
1. Validates collection type
2. Receives file in `req.files.imagen`
3. Validates extension (png, jpg, gif, jpeg)
4. Generates filename: `${id}-${timestamp}.${ext}`
5. Stores in `./uploads/${tipo}/${fileName}`
6. Updates entity with filename
7. Deletes old file if exists

To support new entity types, add to allowed types array in `routes/upload.js`.

## Environment Variables

Required environment variables:
- `CUSTOMCONNSTR_COSMOS_CONNSTR` - CosmosDB connection string (production)
- `PORT` - Server port (defaults to 3000)

Config file (`config/config.js`) contains:
- JWT seed for token signing
- Google OAuth client ID and secret

**Note:** Never commit `.env` file or actual credentials to git.

## Common Patterns

### Error Handling
```javascript
// Always return structured error
Model.findById(id)
  .then(doc => {
    if (!doc) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Entity not found',
        errors: { message: 'Entity not found' }
      });
    }
    // Success path
    res.status(200).json({ ok: true, data: doc });
  })
  .catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Database error',
      errors: err
    });
  });
```

### Query Sorting
Most list endpoints sort by newest first:
```javascript
Entity.find({ state: false }).sort({ _id: 'desc' }).exec(callback);
```

### Float Precision
Use mongoose-float for currency/decimal fields:
```javascript
var Float = require('mongoose-float').loadType(mongoose, 2);
// Then use Float type in schema for 2 decimal places
```

## Domain-Specific Notes

### Distribution Center (Centro de Distribución)
- Customers are separate from transportation customers (CPcustomer)
- Sales have nested `detalles[]` array with material references
- Cash register (`cajaCD`) tracks all monetary transactions
- Inventory discrepancies tracked in `missing-surplus` model

### Transportation (Viajes)
- Employees are primarily drivers
- Each trip type has rate configuration in `typeTrip`
- Bills reference trips and contain customer/destination details
- Orders and pulls track pickup/delivery scheduling

### Workshop (Taller)
- Maintenance records can link to vehicle OR gondola
- Mechanics assigned to pits (service bays)
- Spare part purchases have nested details with part references
- Tire tracking embedded in vehicle model as `pits[]` array
