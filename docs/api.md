# API Documentation

## Component API

### WoconMap Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'global' \| 'trip'` | `'global'` | Map operating mode |
| `tripId` | `string` | `''` | Trip ID for trip-specific mode |
| `readonly` | `boolean` | `false` | Disable map interactions |
| `markers` | `Array<{ lat: number; lng: number }>` | `[]` | Predefined markers for trip mode |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `marker-click` | `string` | Emitted when a trip marker is clicked |
| `marker-add` | `[lat: number, lng: number]` | Emitted when the map is clicked to add a marker |
| `location-found` | `[lat: number, lng: number]` | Emitted when user location is found |
| `location-error` | `string` | Emitted when location access fails |

#### Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------