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
|--------|------------|--------|-------------|
| `flyTo` | `lat: number, lng: number, zoom: number = 12` | `void` | Smoothly animate to a location |
| `switchLayer` | `layer: 'standard' \| 'satellite' \| 'dark'` | `void` | Change map layer style |
| `getUserLocation` | N/A | `void` | Request and show user location |

### Sidebar Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeTab` | `'home' \| 'connections' \| 'search' \| 'discover' \| 'plugins'` | N/A | Currently active tab |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tabChange` | `'home' \| 'connections' \| 'search' \| 'discover