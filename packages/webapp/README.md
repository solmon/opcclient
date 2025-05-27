# OPC Client Web Application

This is a Next.js web application that provides a graphical interface to connect to OPC UA servers and browse their object models. It's part of the OPC Client monorepo.

## Features

- Connect to OPC UA servers with username/password or anonymous authentication
- View server object models in an interactive tree view
- Search and filter nodes in the object model tree
- Automatic dark/light theme support with manual toggle
- Save and manage multiple server connections
- Real-time connection status indicators
- Responsive design optimized for all device sizes
- User-friendly interface built with React and Tailwind CSS

## Getting Started

### From the Monorepo Root

You can run the webapp from the monorepo root using:

```bash
# Development server
pnpm run webapp:dev

# Build for production
pnpm run webapp:build

# Run production build
pnpm run webapp:start
```

### From the Webapp Directory

Alternatively, you can navigate to the webapp directory and run:

```bash
cd packages/webapp

# Development server
pnpm run dev

# Build for production
pnpm run build

# Run production build
pnpm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Integration with OPC Client

This webapp uses the `opcclient` Node.js package from the monorepo to communicate with OPC UA servers. The integration is handled through the `OPCServerManager` class in `src/lib/opc-server-manager.ts`.

## Security Considerations

For production use, you should implement proper authentication and secure credential storage. The current implementation is for demonstration purposes only.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
