<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User;

class link extends Model
{
    //
    protected $fillable = ["user_id", 'original', 'code'];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function generateUniqueCode()
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $maxAttempts = 20; // Prevent infinite loop
        $attempt = 0;

        do {
            if ($attempt >= $maxAttempts) {
                throw new \Exception('Unable to generate unique code after ' . $maxAttempts . ' attempts');
            }

            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }

            $attempt++;
        } while (static::where('code', $code)->exists());

        return $code;
    }
}
