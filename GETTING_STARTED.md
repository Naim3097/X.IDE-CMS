# Nexova Content Planner v2.0

This is the evolved version of the Nexova Content Planner, built with Next.js 15, Tailwind CSS, Shadcn UI, and Firebase.

## Getting Started

1.  **Environment Setup**:
    Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration keys.
    ```bash
    cp .env.local.example .env.local
    ```

2.  **Install Dependencies**:
    (If you haven't already)
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure

-   `src/app`: Next.js App Router pages.
-   `src/features`: Domain-specific logic (Auth, Clients, Planner).
-   `src/components`: Reusable UI components (Shadcn).
-   `src/lib`: Utilities and Firebase config.

## Next Steps

1.  **Authentication**: Implement the Login page in `src/app/(auth)/login/page.tsx`.
2.  **Admin Dashboard**: Build the client management interface in `src/app/(admin)/dashboard/page.tsx`.
3.  **Client Portal**: Build the client view in `src/app/(client)/portal/page.tsx`.
