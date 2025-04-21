<?php

use App\Http\Controllers\LinkController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Link;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    // return Inertia::render('Welcome', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
    return redirect("/login");
});

Route::get('/dashboard', function () {
    $links = Link::where('user_id', Auth::id())
        ->withCount('visits')
        ->get();
        
    return Inertia::render('Dashboard', [
        'links' => $links
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::controller(LinkController::class)->prefix("/links")->group(function () {
        Route::post('/', "store")->name('links.store');
        // Route::get('/', "dashboardLinks"); // Temporarily disabled to avoid conflicts with LinksCard
        Route::get('/stats/{link}', "linkStats")->name('link.stats');
        Route::get('/stats/{link}/export', "exportAnalytics")->name('link.export');
        Route::get('/stats/{link}/report', "getAnalyticsReport")->name('link.report');
        Route::get('/stats/{link}/filter', "filterAnalytics")->name('link.filter');
        Route::delete('/{link}', "destroy")->name('links.destroy');
        Route::put('/{link}', "update")->name('links.update');
    });
});

require __DIR__ . '/auth.php';
Route::get('/{code}', [LinkController::class, 'redirectToOriginal'])
    ->where('code', '^[0-9a-zA-Z]{6}$');
