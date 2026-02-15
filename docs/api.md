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
| `tabChange` | `'home' \| 'connections' \| 'search' \| 'discover' \| 'plugins'` | Emitted when tab is changed |
| `moreClick` | N/A | Emitted when more button is clicked |

### TopBar Component

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `switchLayer` | `'dark' \| 'satellite'` | Emitted when map layer is switched |

### DiscoverPanel Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `true` | Control panel visibility |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | N/A | Emitted when panel is closed |
| `discover-place` | `PlaceInfo` | Emitted when a place is discovered |

## Data Structures

### PlaceInfo

```typescript
interface PlaceInfo {
  geonameid: number;
  name: string;
  asciiname: string;
  country_code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number | null;
}
```

### Trip Data

```typescript
interface Trip {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_public: boolean;
  type: 'recruiting' | 'private';
  created_at: string;
  updated_at: string;
  map_markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
  }>;
  owner: {
    username: string;
    avatar_url: string;
  };
}
```

### User Profile

```typescript
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  interests: string[];
  travel_style: string;
  location: {
    city: string;
    country: string;
  };
}
```

## Supabase API

### Authentication

#### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'traveler123',
      full_name: 'John Doe'
    }
  }
});
```

#### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### Database Queries

#### Get Trips

```typescript
const { data: trips, error } = await supabase
  .from('trips')
  .select(`
    id,
    name,
    type,
    owner:profiles!trips_owner_id_fkey(username),
    map_markers!left(id, lat, lng)
  `)
  .eq('is_public', true);
```

#### Get Cities

```typescript
const { data: cities, error } = await supabase
  .from('cities')
  .select('geonameid, name, asciiname, country_code, latitude, longitude, population')
  .gte('population', 500000)
  .order('population', { ascending: false })
  .limit(50);
```

## Leaflet.js Integration

### Map Initialization

```typescript
map = L.map(mapContainer.value, {
  zoomControl: false,
  inertiaDeceleration: 2000,
  inertiaMaxSpeed: 2500,
  easeLinearity: 0.25,
  wheelDebounceTime: 20,
  wheelPxPerZoomLevel: 45,
  tapTolerance: 10,
  bounceAtZoomLimits: true,
  minZoom: 2,
  maxZoom: 18,
  maxBounds: [[-90, -180], [90, 180]],
  maxBoundsViscosity: 1.0
}).setView([20, 0], 2);
```

### Custom Markers

```typescript
const locationIcon = L.divIcon({
  className: 'location-marker',
  html: `
    <div class="location-marker-content">
      <div class="location-marker-icon"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const marker = L.marker([lat, lng], { icon: locationIcon });
```

### Layer Management

```typescript
const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '&copy; Esri',
  maxZoom: 19
});

const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
});
```

## Geolocation API

### Get Current Position

```typescript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Use position data
    },
    (error) => {
      console.error('Error getting user location:', error);
    }
  );
}
```

### Watch Position

```typescript
if ('geolocation' in navigator) {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Update position marker
    },
    (error) => {
      console.error('Error watching position:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
  
  // To stop watching
  // navigator.geolocation.clearWatch(watchId);
}
```

## Global Events

### Custom Events

| Event | Detail | Description |
|-------|--------|-------------|
| `discover-place` | `PlaceInfo` | Dispatched when a new place is discovered |
| `trip-click` | `string` | Dispatched when a trip marker is clicked |
| `map-layer-change` | `'standard' \| 'satellite' \| 'dark'` | Dispatched when map layer is changed |

### Event Listeners

```typescript
// Listen for discover-place event
window.addEventListener('discover-place', (e: CustomEvent) => {
  const place = e.detail;
  // Handle discovered place
});

// Dispatch custom event
const event = new CustomEvent('trip-click', {
  detail: tripId
});
window.dispatchEvent(event);
```

## Error Handling

### Common Errors

| Error Type | Message | Solution |
|------------|---------|----------|
| Location Access | `PositionError: User