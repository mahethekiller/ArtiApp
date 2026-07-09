# Laravel API Separation Instructions (Option 1 - Prefixed Namespaces)

This document contains instructions for an AI agent to build the backend APIs in an **existing Laravel application** without conflicts. It implements complete isolation by namespacing the controllers, models, requests, resources, and prefixing all database tables.

---

## 1. Directory Structure & Namespaces

Generate all backend files inside these segregated folders:

### Models (`app/Models/Arti/`)
* **Namespace:** `App\Models\Arti`
* **Models Required:**
  * `Deity` (associated with table `arti_deities`)
  * `Aarti` (associated with table `arti_aartis`)
  * `ArtiUser` (associated with table `arti_users` to keep user registration separate, OR use the existing application `User` model)
  * `Favorite` (associated with table `arti_favorites`)
  * `Reminder` (associated with table `arti_reminders`)
  * `GalleryImage` (associated with table `arti_gallery_images`)
  * `PrayerHistory` (associated with table `arti_prayer_histories`)

### Controllers (`app/Http/Controllers/Api/Arti/`)
* **Namespace:** `App\Http\Controllers\Api\Arti`
* **Controllers Required:**
  * `DeityController`
  * `AartiController`
  * `GalleryController`
  * `ProfileController`
  * `ReminderController`
  * `FavoriteController`
  * `AuthController` (Handles registrations/sessions for `arti_users`)

### Requests & Resources (`app/Http/Requests/Arti/` & `app/Http/Resources/Arti/`)
* **Namespace:** `App\Http\Requests\Arti` & `App\Http\Resources\Arti`

---

## 2. Prefixed Database Tables (Migrations)

Create database migrations with the `arti_` prefix for all tables:

### `arti_deities` table
* `id` - BIGINT UNSIGNED Auto Increment
* `name` - VARCHAR (e.g., 'Ganesha', 'Shiva', 'Krishna')
* `description` - VARCHAR (e.g., 'Remover of Obstacles')
* `image_url` - VARCHAR
* `timestamps`

### `arti_aartis` table
* `id` - BIGINT UNSIGNED Auto Increment
* `deity_id` - BIGINT UNSIGNED Foreign Key references `arti_deities(id)` on delete cascade
* `title` - VARCHAR
* `subtitle` - VARCHAR (e.g. 'Sukh Karta Dukh Harta')
* `category` - VARCHAR (e.g., 'Popular', 'Morning', 'Evening')
* `duration` - VARCHAR
* `audio_url` - VARCHAR
* `video_url` - VARCHAR (YouTube video link or ID)
* `lyrics` - JSON (Array of lyric objects with timestamps)
* `timestamps`

### `arti_users` table
*(Note: If you prefer to reuse your existing app's `users` table instead of an isolated one, you can link the foreign keys directly to `users` and bypass this table)*
* `id` - BIGINT UNSIGNED Auto Increment
* `name` - VARCHAR (default: 'Seeker of Peace')
* `email` - VARCHAR Unique
* `password` - VARCHAR
* `gotra` - VARCHAR (nullable)
* `rashi` - VARCHAR (nullable)
* `streak_count` - INT (default: 0)
* `last_prayer_date` - DATE (nullable)
* `timestamps`

### `arti_favorites` table
* `id` - BIGINT UNSIGNED Auto Increment
* `user_id` - BIGINT UNSIGNED Foreign Key references `arti_users(id)` (or `users(id)`) on delete cascade
* `aarti_id` - BIGINT UNSIGNED Foreign Key references `arti_aartis(id)` on delete cascade
* `timestamps`

### `arti_gallery_images` table
* `id` - BIGINT UNSIGNED Auto Increment
* `deity_id` - BIGINT UNSIGNED Foreign Key references `arti_deities(id)` on delete cascade
* `title` - VARCHAR
* `image_url` - VARCHAR
* `download_count` - INT (default: 0)
* `timestamps`

### `arti_reminders` table
* `id` - BIGINT UNSIGNED Auto Increment
* `user_id` - BIGINT UNSIGNED Foreign Key references `arti_users(id)` (or `users(id)`) on delete cascade
* `title` - VARCHAR
* `time` - TIME (e.g. '06:00:00')
* `is_enabled` - BOOLEAN (default: true)
* `timestamps`

### `arti_prayer_histories` table
* `id` - BIGINT UNSIGNED Auto Increment
* `user_id` - BIGINT UNSIGNED Foreign Key references `arti_users(id)` (or `users(id)`) on delete cascade
* `aarti_id` - BIGINT UNSIGNED Foreign Key references `arti_aartis(id)` on delete cascade
* `played_at` - TIMESTAMP (default: CURRENT_TIMESTAMP)
* `duration_played` - INT (in seconds)
* `timestamps`

---

## 3. Dedicated Route Registry & Prefix

Write all route rules into a separate routing file: `routes/arti.php`.

### Route Group Definition (Prefix: `/api/arti/`)

In your application's route registrar (`app/Providers/RouteServiceProvider.php` for Laravel 10, or `bootstrap/app.php` for Laravel 11), load this route file with the **`api/arti`** prefix:

```php
// If Laravel 11 bootstrap/app.php:
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('api/arti')
            ->name('arti.')
            ->group(base_path('routes/arti.php'));
    }
)
```

### Route Rules (`routes/arti.php`)

```php
use App\Http\Controllers\Api\Arti\DeityController;
use App\Http\Controllers\Api\Arti\AartiController;
use App\Http\Controllers\Api\Arti\GalleryController;
use App\Http\Controllers\Api\Arti\ProfileController;
use App\Http\Controllers\Api\Arti\ReminderController;
use App\Http\Controllers\Api\Arti\FavoriteController;
use App\Http\Controllers\Api\Arti\AuthController;

// Auth Routes (Pre-prefixed by api/arti)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Read Routes
Route::get('/deities', [DeityController::class, 'index']);
Route::get('/aartis', [AartiController::class, 'index']);
Route::get('/aartis/{id}', [AartiController::class, 'show']);
Route::get('/gallery', [GalleryController::class, 'index']);

// Protected User Routes (Require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/streak', [ProfileController::class, 'incrementStreak']);
    Route::get('/profile/history', [ProfileController::class, 'history']);
    Route::post('/profile/history', [ProfileController::class, 'logHistory']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);

    // Reminders
    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::put('/reminders/{id}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{id}', [ReminderController::class, 'destroy']);
});
```

---

## 4. Seeder Data Requirements
Ensure to seed initial records using `ArtiDeitySeeder`, `ArtiAartiSeeder`, and `ArtiGallerySeeder`:
1. **Deities**: Ganesha, Shiva, Krishna, Durga, Hanuman, Lakshmi.
2. **Aartis**:
   - Ganesha: *Shree Ganesh Aarti* (YouTube video: `y25k2S9n_4Y`)
   - Shiva: *Shiv Aarti*
   - Hanuman: *Hanuman Chalisa*
   - Lakshmi: *Lakshmi Mata Aarti*
3. **Gallery**: High-res wallpapers matching the seeded deities.
