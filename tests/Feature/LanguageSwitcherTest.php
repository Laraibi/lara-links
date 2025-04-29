<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class LanguageSwitcherTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user
        $this->user = User::factory()->create();
    }

    /**
     * Test that the language switcher sets the locale in the session and cookie.
     */
    public function test_language_switcher_sets_locale()
    {
        // Act as the user
        $this->actingAs($this->user);

        // Start the session
        $this->withSession([]);

        // Test switching to French
        $response = $this->post(route('language.switch', ['locale' => 'fr']));
        
        // Assert the session has the locale
        $this->assertEquals('fr', Session::get('locale'));
        
        // Assert the application locale is set
        $this->assertEquals('fr', App::getLocale());
        
        // Test switching to English
        $response = $this->post(route('language.switch', ['locale' => 'en']));
        
        // Assert the session has the locale
        $this->assertEquals('en', Session::get('locale'));
        
        // Assert the application locale is set
        $this->assertEquals('en', App::getLocale());
    }
    
    /**
     * Test that the language switcher handles invalid locales.
     */
    public function test_language_switcher_handles_invalid_locale()
    {
        // Act as the user
        $this->actingAs($this->user);

        // Start the session
        $this->withSession([]);

        // Test switching to an invalid locale
        $response = $this->post(route('language.switch', ['locale' => 'invalid']));
        
        // Assert the session has the default locale
        $this->assertEquals('en', Session::get('locale'));
        
        // Assert the application locale is set to default
        $this->assertEquals('en', App::getLocale());
    }
    
    /**
     * Test that the language switcher preserves the locale across requests.
     */
    public function test_language_switcher_preserves_locale()
    {
        // Act as the user
        $this->actingAs($this->user);

        // Start the session
        $this->withSession([]);

        // Switch to French
        $response = $this->post(route('language.switch', ['locale' => 'fr']));
        
        // Make another request
        $response = $this->get('/dashboard');
        
        // Assert the locale is still French
        $this->assertEquals('fr', Session::get('locale'));
        $this->assertEquals('fr', App::getLocale());
    }
}
