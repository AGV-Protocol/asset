# Real World Assets - Asset Onboarding Platform

A Next.js application for asset registration and management, built for AGV Protocol's real-world asset tokenization platform.

## Features

- **Multi-step Asset Registration Form**: Comprehensive form with 4 sections covering basic data, financial information, operations & compliance, and tier-specific data
- **Dynamic Form Sections**: Different forms based on selected tier (Orchard Data, Solar Data, Compute Data)
- **Review System**: Complete review of all submitted data before final submission
- **Admin Dashboard**: Management interface for reviewing and approving asset submissions
- **Firestore Integration**: Secure data storage and retrieval
- **Responsive Design**: Mobile-friendly interface with glass morphism effects

## Form Sections

### 1. Basic Data
- Project information (name, land parcel ID)
- Location details (county, city, province, GPS coordinates)
- Land type selection (Orchard, Farmland, Facility Agriculture)
- Ownership information (lease contract, duration, owner)

### 2. Financial & Revenue Data
- Investment costs and cash flow breakdown
- Revenue streams (orchard products, solar electricity)
- Subsidies and green certificate income
- IRR/ROI calculations

### 3. Operations & Compliance
- Company information and business licenses
- EPC/O&M contractor details
- Government filing and approval documents
- Operating entity selection
- Tier selection (Orchard, Solar, or Compute Data)

### 4. Tier-Specific Data

#### Orchard Data
- Planting area and tree information
- Age, variety, and density details
- Yield information and monitoring systems
- IoT device integration

#### Solar Data
- Installed capacity and PV module details
- Grid connection and power generation data
- Tariff and PPA contract information

## Admin Features

- View all asset submissions
- Filter by status (pending, approved, rejected)
- Search by project name, land parcel ID, or company
- Approve or reject submissions
- View detailed submission information
- Delete submissions

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
   ```

3. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Create a service account and download the private key
   - Update the environment variables

4. **Add Images**
   Place the following images in the `public` folder:
   - `logo.png` - Main logo for header
   - `footer-logo.png` - Logo for footer
   - `background.jpg` - Background image for the main page

5. **Run the Application**
```bash
npm run dev
   ```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── assets/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── admin/
│   │   ├── page.tsx
│   │   └── assets/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── asset-form/
│   │   ├── asset-registration-form.tsx
│   │   ├── footer.tsx
│   │   ├── form-section.tsx
│   │   ├── header.tsx
│   │   ├── option-selector.tsx
│   │   └── step-indicator.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       └── switch.tsx
└── lib/
    ├── firebase.ts
    ├── firebase-admin.ts
    └── utils.ts
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Firebase** - Database and authentication
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons

## API Endpoints

- `POST /api/assets` - Submit new asset registration
- `GET /api/assets` - Get all asset submissions (with optional status filter)
- `GET /api/assets/[id]` - Get specific asset submission
- `PUT /api/assets/[id]` - Update asset submission
- `DELETE /api/assets/[id]` - Delete asset submission

## Styling

The application uses a consistent design system with:
- Primary color: `#3399FF` (AGV Protocol blue)
- Glass morphism effects for form containers
- Responsive grid layouts
- Consistent spacing and typography
- Background images for visual appeal

## Future Enhancements

- User authentication and role-based access
- File upload for documents
- Email notifications
- Advanced filtering and sorting
- Export functionality
- Audit trail
- Integration with blockchain networks