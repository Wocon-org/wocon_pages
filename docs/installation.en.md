# Installation Guide

## Environment Requirements

Before installing the Wocon project, ensure your system meets the following requirements:

- **Node.js**：v16.0 or higher
- **npm**：v7.0 or higher
- **Git**：Latest version
- **Development Tools**：
  - VS Code
  - Trae (AI-assisted development tool)
  - GitHub Desktop (optional)
  - TablePlus (database management tool)

## Project Installation

### 1. Clone the Repository

Clone the Wocon project repository using Git：

```bash
git clone https://github.com/wocon-org/wocon_pages.git
cd wocon_pages
```

### 2. Install Dependencies

Install project dependencies using npm：

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and configure the following environment variables：

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Other Configuration
VITE_APP_TITLE=Wocon
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server

Start the local development server：

```bash
npm run dev
```

Once the server is running, you can access the application at：
- **Local Address**：http://localhost:5173
- **Network Address**：http://your-local-ip:5173

## Build Production Version

When you're ready to deploy the application, run the following command to build the production version：

```bash
npm run build
```

After the build is complete, production files will be generated in the `dist` directory.

## Deploy to Cloudflare Pages

### 1. Prepare GitHub Repository

Ensure your code is pushed to a GitHub repository.

### 2. Configure Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to the **Pages** section
3. Click **Create a project**
4. Select your GitHub repository
5. Configure build settings：
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Environment variables**：Add your Supabase configuration

### 3. Deploy

Click the **Deploy** button, and Cloudflare Pages will automatically build and deploy your application.

## Database Configuration (Supabase)

### 1. Create Supabase Project

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Create a new Supabase project
3. Record your project's URL and anonymous key

### 2. Database Table Structure

The Wocon project requires the following database tables：

- **profiles**：User information
- **trips**：Travel itineraries
- **map_markers**：Map markers
- **cities**：City data
- **connections**：User connections

### 3. Import Sample Data

You can use TablePlus to connect to your Supabase database and import sample data.

## Common Issues

### Dependency Installation Failed

If you encounter dependency installation failures, try：

```bash
npm cache clean --force
npm install
```

### Development Server Failed to Start

Ensure port 5173 is not occupied by another process, or use a different port：

```bash
npm run dev -- --port 3000
```

### Supabase Connection Issues

Check that your Supabase configuration in the `.env` file is correct and ensure network connectivity is normal.

## Technical Support

If you encounter issues during installation, refer to：
- [Vue Official Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Official Documentation](https://vitejs.dev/guide/)
- [Supabase Official Documentation](https://supabase.com/docs)
- [Leaflet.js Official Documentation](https://leafletjs.com/reference.html)