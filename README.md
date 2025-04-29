# Lara Links

A modern link management system built with Laravel 10, React, and Inertia.js. This application allows users to create, manage, and share their links with a beautiful and responsive interface.

## Features

- 🔐 User Authentication
- 🔗 Link Management
  - Create, edit, and delete links
  - Custom link titles and URLs
  - Link status tracking (active/inactive)
  - Link click tracking
- 🌐 Internationalization
  - English and French language support
  - Seamless language switching
  - Persistent language preferences
- 🎨 Modern UI/UX
  - Responsive design
  - Dark/Light mode support
  - Beautiful animations
  - Loading states
- 📊 Analytics
  - Link click tracking
  - User activity monitoring
- 🔒 Security
  - CSRF protection
  - XSS prevention
  - Secure authentication
  - Rate limiting

## Tech Stack

- **Backend:**
  - Laravel 10
  - PHP 8.2+
  - MySQL/PostgreSQL
  - Redis (for caching)

- **Frontend:**
  - React 18
  - Inertia.js
  - Tailwind CSS
  - i18next
  - Redux Toolkit

- **Development:**
  - Vite
  - ESLint
  - Prettier
  - PHPUnit
  - Jest

## Prerequisites

- PHP 8.2 or higher
- Node.js 18 or higher
- Composer
- MySQL/PostgreSQL
- Redis (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lara-links.git
   cd lara-links
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install JavaScript dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Configure your database in `.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=lara_links
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

7. Run migrations:
   ```bash
   php artisan migrate
   ```

8. Build assets:
   ```bash
   npm run build
   ```

9. Start the development server:
   ```bash
   php artisan serve
   ```

## Development

- Start the Vite development server:
  ```bash
  npm run dev
  ```

- Run tests:
  ```bash
  php artisan test
  ```

- Run frontend tests:
  ```bash
  npm test
  ```

## Project Structure

```
lara-links/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Providers/
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   ├── Pages/
│   │   └── store/
│   └── views/
├── routes/
├── tests/
└── config/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Laravel](https://laravel.com)
- [React](https://reactjs.org)
- [Inertia.js](https://inertiajs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [i18next](https://www.i18next.com)
